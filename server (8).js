import { randomUUID } from "node:crypto";
import { db, rows, transaction } from "../../../shared/db.js";
import { startServer, currentUser } from "../../../shared/http.js";
import { HttpError, text, requireRow } from "../../../shared/validation.js";
import { event, startOutbox } from "../../../shared/events.js";
const pool = db("citas");
async function reserve(conn, id) {
  const slot = requireRow(
    (
      await rows(
        conn,
        "SELECT * FROM slots WHERE id=? AND fecha>CURDATE() FOR UPDATE",
        [id],
      )
    )[0],
  );
  if (!slot.available)
    throw new HttpError(409, "Ese horario acaba de ocuparse. Elige otro.");
  await rows(conn, "UPDATE slots SET available=0 WHERE id=?", [id]);
  return slot;
}
startServer("citas", async (req, url, b) => {
  const u = await currentUser(req),
    p = url.pathname,
    m = req.method;
  if (u.estado !== "Activo")
    throw new HttpError(403, "Tu afiliación no está activa.");
  if (p === "/disponibilidad" && m === "GET") {
    const sp = url.searchParams.get("especialidad") || "";
    return {
      data: await rows(
        pool,
        "SELECT * FROM slots WHERE available=1 AND fecha>CURDATE() AND (?='' OR especialidad=?) ORDER BY fecha,hora LIMIT 168",
        [sp, sp],
      ),
    };
  }
  if (p === "/" && m === "GET")
    return {
      data: await rows(
        pool,
        "SELECT a.id,a.estado,a.created_at,s.especialidad,s.profesional,s.sede,s.fecha,s.hora,a.slot_id FROM appointments a JOIN slots s ON s.id=a.slot_id WHERE a.user_id=? ORDER BY s.fecha DESC,s.hora",
        [u.id],
      ),
    };
  if (p === "/" && m === "POST") {
    const id = randomUUID(),
      slotId = text(b.slotId, "Horario", 1, 36);
    await transaction(pool, async (c) => {
      const slot = await reserve(c, slotId);
      await rows(
        c,
        "INSERT INTO appointments(id,user_id,slot_id)VALUES(?,?,?)",
        [id, u.id, slotId],
      );
      await event(
        c,
        u.id,
        "Cita agendada",
        `${slot.especialidad} · ${slot.fecha} a las ${slot.hora}.`,
        "citas",
      );
    });
    return { status: 201, data: { id, estado: "Agendada" } };
  }
  const match = p.match(/^\/([^/]+)\/(cancelar|reagendar)$/);
  if (match && m === "PATCH") {
    await transaction(pool, async (c) => {
      const appointment = requireRow(
        (
          await rows(
            c,
            "SELECT * FROM appointments WHERE id=? AND user_id=? FOR UPDATE",
            [match[1], u.id],
          )
        )[0],
      );
      if (appointment.estado !== "Agendada")
        throw new HttpError(409, "Esta cita ya no admite cambios.");
      if (match[2] === "cancelar") {
        await rows(c, "UPDATE appointments SET estado='Cancelada' WHERE id=?", [
          appointment.id,
        ]);
      } else {
        const next = text(b.slotId, "Nuevo horario", 1, 36);
        if (next === appointment.slot_id)
          throw new HttpError(400, "Elige un horario diferente.");
        await reserve(c, next);
        await rows(c, "UPDATE appointments SET slot_id=? WHERE id=?", [
          next,
          appointment.id,
        ]);
      }
      await rows(c, "UPDATE slots SET available=1 WHERE id=?", [
        appointment.slot_id,
      ]);
      await event(
        c,
        u.id,
        match[2] === "cancelar" ? "Cita cancelada" : "Cita reprogramada",
        "El cambio quedó guardado en tu agenda.",
        "citas",
      );
    });
    return { data: { ok: true } };
  }
});
startOutbox(pool);
