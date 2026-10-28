import { createServer } from "node:http";
import { HttpError } from "./validation.js";
import { ports, host, internalKey } from "./config.js";
import { equalSecret } from "./security.js";
export async function internal(name, path, options = {}) {
  const res = await fetch(`http://127.0.0.1:${ports[name]}${path}`, {
    ...options,
    signal: AbortSignal.timeout(6000),
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Key": internalKey,
      ...options.headers,
    },
  });
  const b = await res.json();
  if (!res.ok)
    throw new HttpError(
      res.status === 401 ? 401 : 503,
      b.error?.message || "Servicio no disponible.",
    );
  return b.data;
}
export async function currentUser(req) {
  try {
    return await internal("afiliados", "/_internal/sesion", {
      headers: { Cookie: req.headers.cookie || "" },
    });
  } catch (e) {
    if (e.status === 401) throw e;
    throw new HttpError(503, "No podemos verificar tu sesión en este momento.");
  }
}
export function requireInternal(req) {
  if (!equalSecret(req.headers["x-internal-key"], internalKey))
    throw new HttpError(401, "Acceso no autorizado.");
}
async function body(req) {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) return {};
  if ((req.headers["content-type"] || "").split(";")[0] !== "application/json")
    throw new HttpError(415, "Se requiere JSON.");
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 32768)
      throw new HttpError(413, "La solicitud supera el tamaño permitido.");
    chunks.push(c);
  }
  try {
    const b = JSON.parse(Buffer.concat(chunks).toString());
    if (!b || typeof b !== "object" || Array.isArray(b)) throw Error();
    return b;
  } catch {
    throw new HttpError(400, "El contenido no es válido.");
  }
}
export function startServer(name, handler) {
  if (internalKey.length < 24)
    throw new Error("Ejecuta npm run setup: falta INTERNAL_API_KEY.");
  const server = createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    try {
      const origin = req.headers.origin;
      if (
        origin &&
        ![
          "http://127.0.0.1:5173",
          "http://localhost:5173",
          `http://127.0.0.1:${process.env.GATEWAY_PORT || 3000}`,
        ].includes(origin)
      )
        throw new HttpError(403, "Origen no permitido.");
      const url = new URL(req.url, "http://localhost");
      if (url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ data: { service: name, status: "ok" } }),
        );
      }
      const result = await handler(req, url, await body(req));
      if (result === undefined) throw new HttpError(404, "Ruta no encontrada.");
      if (result.cookie) res.setHeader("Set-Cookie", result.cookie);
      if (result.raw) {
        res.writeHead(200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${result.filename}"`,
        });
        return res.end(result.raw);
      }
      res.writeHead(result.status || 200, {
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify({ data: result.data }));
    } catch (e) {
      const status = e.status || (e.code === "ER_DUP_ENTRY" ? 409 : 500);
      if (status === 500) console.error(name, e.code || e.name);
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: {
            message:
              status === 500
                ? "El servicio no pudo completar tu solicitud."
                : e.code === "ER_DUP_ENTRY"
                  ? "La información ya está registrada."
                  : e.message,
          },
        }),
      );
    }
  });
  server.listen(ports[name], host, () =>
    console.log(`${name}: http://${host}:${ports[name]}`),
  );
  server.on("error", (e) => {
    console.error(name, e.code);
    process.exit(1);
  });
  return server;
}
