import { randomUUID } from "node:crypto";
import { rows, transaction } from "../../../shared/db.js";
import { startServer, requireInternal } from "../../../shared/http.js";
import {
  HttpError,
  text,
  email,
  date,
  contact,
  choice,
  requireRow,
} from "../../../shared/validation.js";
import {
  hashPassword,
  verifyPassword,
  sessionToken,
  tokenHash,
  cookieToken,
  sessionCookie,
} from "../../../shared/security.js";
import { event, startOutbox } from "../../../shared/events.js";
import { pool, profile, publicProfile } from "./repositories/profile.js";
const attempts = new Map();
async function session(req) {
  const token = cookieToken(req);
  const sessions = await rows(
    pool,
    "SELECT user_id FROM sessions WHERE token_hash=? AND expires_at>UTC_TIMESTAMP()",
    [tokenHash(token)],
  );
  if (!sessions[0]) throw new HttpError(401, "Inicia sesión para continuar.");
  return publicProfile(requireRow(await profile(sessions[0].user_id)));
}
async function loginUser(user) {
  const token = sessionToken();
  await rows(
    pool,
    "INSERT INTO sessions(token_hash,user_id,expires_at)VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 8 HOUR))",
    [tokenHash(token), user.id],
  );
  return { data: publicProfile(user), cookie: sessionCookie(token) };
}
startServer("afiliados", async (req, url, b) => {
  const p = url.pathname,
    m = req.method;
  if (p === "/registro" && m === "POST") {
    const nombres = text(b.nombres, "Nombres", 2, 100),
      apellidos = text(b.apellidos, "Apellidos", 2, 100),
      correo = email(b.email),
      password = text(b.password, "Contraseña", 8, 100),
      nacimiento = date(b.nacimiento),
      documento = text(b.documento, "Documento", 3, 30),
      tipo = choice(
        b.tipoDocumento,
        ["CC", "TI", "CE", "PPT"],
        "Tipo de documento",
      ),
      c = contact(b);
    if (b.consentimiento !== true)
      throw new HttpError(
        400,
        "Debes aceptar el tratamiento de tus datos de prueba.",
      );
    const id = randomUUID();
    await transaction(pool, async (conn) => {
      await rows(
        conn,
        "INSERT INTO users(id,email,password_hash,nombres,apellidos,tipo_documento,documento,nacimiento,telefono,direccion,ciudad)VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        [
          id,
          correo,
          hashPassword(password),
          nombres,
          apellidos,
          tipo,
          documento,
          nacimiento,
          c.telefono,
          c.direccion,
          c.ciudad,
        ],
      );
      await event(
        conn,
        id,
        "Tu cuenta está lista",
        "Ya puedes explorar el portal de práctica.",
        "afiliados",
      );
    });
    return { ...(await loginUser(await profile(id))), status: 201 };
  }
  if (p === "/login" && m === "POST") {
    const mail = email(b.email),
      pass = text(b.password, "Contraseña", 1, 100),
      key = `${req.socket.remoteAddress}:${mail}`,
      now = Date.now();
    const a = attempts.get(key) || { count: 0, time: now };
    if (now - a.time > 600000) {
      a.count = 0;
      a.time = now;
    }
    if (a.count >= 10)
      throw new HttpError(429, "Demasiados intentos. Espera unos minutos.");
    a.count++;
    attempts.set(key, a);
    const user = (
      await rows(pool, "SELECT * FROM users WHERE email=?", [mail])
    )[0];
    if (!user || !verifyPassword(pass, user.password_hash))
      throw new HttpError(401, "Correo o contraseña incorrectos.");
    attempts.delete(key);
    return loginUser(user);
  }
  if (p === "/logout" && m === "POST") {
    await rows(pool, "DELETE FROM sessions WHERE token_hash=?", [
      tokenHash(cookieToken(req)),
    ]);
    return { data: { ok: true }, cookie: sessionCookie("", 0) };
  }
  if (p === "/_internal/sesion") {
    requireInternal(req);
    return { data: await session(req) };
  }
  if (p.startsWith("/_internal/usuarios/")) {
    requireInternal(req);
    return {
      data: publicProfile(requireRow(await profile(p.split("/").at(-1)))),
    };
  }
  const user = await session(req);
  if (p === "/me" && m === "GET") return { data: user };
  if (p === "/me" && m === "PATCH") {
    const c = contact(b);
    await transaction(pool, async (conn) => {
      await rows(
        conn,
        "UPDATE users SET telefono=?,direccion=?,ciudad=? WHERE id=?",
        [c.telefono, c.direccion, c.ciudad, user.id],
      );
      await event(
        conn,
        user.id,
        "Datos actualizados",
        "Guardamos tus datos de contacto.",
        "perfil",
      );
    });
    return { data: publicProfile(await profile(user.id)) };
  }
  if (p === "/beneficiarios" && m === "GET")
    return {
      data: await rows(
        pool,
        "SELECT id,nombre,documento,parentesco,nacimiento FROM beneficiaries WHERE user_id=? ORDER BY nombre",
        [user.id],
      ),
    };
  if (p === "/beneficiarios" && m === "POST") {
    const id = randomUUID(),
      nombre = text(b.nombre, "Nombre", 3, 150),
      documento = text(b.documento, "Documento", 3, 30),
      parentesco = choice(
        b.parentesco,
        ["Hijo/a", "Pareja", "Madre/Padre", "Otro"],
        "Parentesco",
      ),
      nacimiento = date(b.nacimiento);
    await transaction(pool, async (conn) => {
      await rows(
        conn,
        "INSERT INTO beneficiaries(id,user_id,nombre,documento,parentesco,nacimiento)VALUES(?,?,?,?,?,?)",
        [id, user.id, nombre, documento, parentesco, nacimiento],
      );
      await event(
        conn,
        user.id,
        "Grupo familiar actualizado",
        "Agregaste un integrante a tu grupo de práctica.",
        "perfil",
      );
    });
    return {
      status: 201,
      data: { id, nombre, documento, parentesco, nacimiento },
    };
  }
  if (p.startsWith("/beneficiarios/") && m === "DELETE") {
    const result = await rows(
      pool,
      "DELETE FROM beneficiaries WHERE id=? AND user_id=?",
      [p.split("/").at(-1), user.id],
    );
    if (!result.affectedRows)
      throw new HttpError(404, "Integrante no encontrado.");
    return { data: { ok: true } };
  }
});
startOutbox(pool);
