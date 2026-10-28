import { randomUUID } from "node:crypto";
import { db, rows, transaction } from "../../../shared/db.js";
import { startServer, currentUser } from "../../../shared/http.js";
import { text, choice, requireRow } from "../../../shared/validation.js";
import { event, startOutbox } from "../../../shared/events.js";
const pool = db("atencion");
startServer("atencion", async (req, url, b) => {
  const u = await currentUser(req),
    p = url.pathname,
    m = req.method;
  if (p === "/" && m === "GET")
    return {
      data: await rows(
        pool,
        "SELECT id,radicado,tipo,asunto,estado,created_at FROM cases WHERE user_id=? ORDER BY created_at DESC",
        [u.id],
      ),
    };
  if (p === "/" && m === "POST") {
    const id = randomUUID(),
      tipo = choice(
        b.tipo,
        ["Petición", "Queja", "Reclamo", "Sugerencia"],
        "Tipo",
      ),
      asunto = text(b.asunto, "Asunto", 8, 150),
      descripcion = text(b.descripcion, "Descripción", 20, 2000),
      radicado = `VIR-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${id.slice(0, 8).toUpperCase()}`;
    await transaction(pool, async (c) => {
      await rows(
        c,
        "INSERT INTO cases(id,user_id,radicado,tipo,asunto,descripcion)VALUES(?,?,?,?,?,?)",
        [id, u.id, radicado, tipo, asunto, descripcion],
      );
      await event(
        c,
        u.id,
        "Tu solicitud quedó radicada",
        `Referencia ${radicado}. Puedes consultar su seguimiento.`,
        "atencion",
      );
    });
    return { status: 201, data: { id, radicado, estado: "Radicada" } };
  }
  const match = p.match(/^\/([^/]+)(\/mensajes)?$/);
  if (match) {
    const item = requireRow(
      (
        await rows(pool, "SELECT * FROM cases WHERE id=? AND user_id=?", [
          match[1],
          u.id,
        ])
      )[0],
    );
    if (m === "GET" && !match[2])
      return {
        data: {
          ...item,
          mensajes: await rows(
            pool,
            "SELECT id,mensaje,created_at FROM messages WHERE case_id=? ORDER BY created_at",
            [item.id],
          ),
        },
      };
    if (m === "POST" && match[2]) {
      await rows(
        pool,
        "INSERT INTO messages(id,case_id,mensaje)VALUES(?,?,?)",
        [randomUUID(), item.id, text(b.mensaje, "Mensaje", 10, 1500)],
      );
      return { status: 201, data: { ok: true } };
    }
  }
});
startOutbox(pool);
