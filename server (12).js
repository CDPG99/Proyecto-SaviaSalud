import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { db, rows } from "../../../shared/db.js";
import {
  startServer,
  currentUser,
  requireInternal,
  internal,
} from "../../../shared/http.js";
import { text, HttpError } from "../../../shared/validation.js";
const pool = db("notificaciones");
startServer("notificaciones", async (req, url, b) => {
  const p = url.pathname,
    m = req.method;
  if (p === "/_internal/eventos" && m === "POST") {
    requireInternal(req);
    const id = text(b.id, "Evento", 1, 36),
      user = text(b.userId, "Usuario", 1, 36);
    await rows(
      pool,
      "INSERT IGNORE INTO notifications(id,event_id,user_id,titulo,mensaje,link,email_status)VALUES(?,?,?,?,?,?,?)",
      [
        randomUUID(),
        id,
        user,
        text(b.title, "Título", 1, 160),
        text(b.message, "Mensaje", 1, 2000),
        text(b.link, "Enlace", 1, 150),
        process.env.SMTP_HOST ? "Pendiente" : "Sin configurar",
      ],
    );
    return { status: 201, data: { ok: true } };
  }
  const u = await currentUser(req);
  if (p === "/" && m === "GET")
    return {
      data: await rows(
        pool,
        "SELECT id,titulo,mensaje,link,leida,email_status,created_at FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100",
        [u.id],
      ),
    };
  if (p === "/preferencias" && m === "GET") {
    const p = (
      await rows(
        pool,
        "SELECT email_enabled FROM preferences WHERE user_id=?",
        [u.id],
      )
    )[0];
    return {
      data: {
        emailEnabled: p ? p.email_enabled === 1 : true,
        smtpConfigured: Boolean(process.env.SMTP_HOST),
      },
    };
  }
  if (p === "/preferencias" && m === "PATCH") {
    if (typeof b.emailEnabled !== "boolean")
      throw new HttpError(400, "Preferencia no válida.");
    await rows(
      pool,
      "INSERT INTO preferences(user_id,email_enabled)VALUES(?,?) ON DUPLICATE KEY UPDATE email_enabled=?",
      [u.id, b.emailEnabled ? 1 : 0, b.emailEnabled ? 1 : 0],
    );
    return { data: { ok: true } };
  }
  if (p === "/leer-todas" && m === "PATCH") {
    await rows(pool, "UPDATE notifications SET leida=1 WHERE user_id=?", [
      u.id,
    ]);
    return { data: { ok: true } };
  }
  if (p.startsWith("/") && m === "PATCH") {
    const result = await rows(
      pool,
      "UPDATE notifications SET leida=1 WHERE id=? AND user_id=?",
      [p.slice(1), u.id],
    );
    if (!result.affectedRows) throw new HttpError(404, "Aviso no encontrado.");
    return { data: { ok: true } };
  }
});
if (process.env.SMTP_HOST) {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    ...(process.env.SMTP_USER
      ? {
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        }
      : {}),
    connectionTimeout: 5000,
    socketTimeout: 10000,
  });
  let running = false;
  setInterval(
    async () => {
      if (running) return;
      running = true;
      try {
        const pending = await rows(
          pool,
          "SELECT * FROM notifications WHERE email_status='Pendiente' LIMIT 10",
        );
        for (const n of pending) {
          const pref = (
            await rows(
              pool,
              "SELECT email_enabled FROM preferences WHERE user_id=?",
              [n.user_id],
            )
          )[0];
          if (pref?.email_enabled === 0) {
            await rows(
              pool,
              "UPDATE notifications SET email_status='Desactivado' WHERE id=?",
              [n.id],
            );
            continue;
          }
          try {
            const user = await internal(
              "afiliados",
              `/_internal/usuarios/${n.user_id}`,
            );
            await transport.sendMail({
              from: process.env.MAIL_FROM,
              to: user.email,
              subject: `Virelia: ${n.titulo}`,
              text: "Tienes una nueva actualización en tu portal de práctica. Inicia sesión para consultarla.",
            });
            await rows(
              pool,
              "UPDATE notifications SET email_status='Enviado' WHERE id=?",
              [n.id],
            );
          } catch {
            break;
          }
        }
      } catch (e) {
        console.error("Correo:", e.code || e.name);
      } finally {
        running = false;
      }
    },
    Math.max(200, Number(process.env.SMTP_POLL_MS || 10000)),
  ).unref();
}
