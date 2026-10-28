import { createServer, request } from "node:http";
import { ports, host } from "../shared/config.js";
const port = Number(process.env.GATEWAY_PORT || 3000);
createServer((req, res) => {
  const u = new URL(req.url, "http://localhost"),
    p = u.pathname.split("/"),
    n = p[2];
  res.setHeader("Cache-Control", "no-store");
  if (p[1] !== "api" || !ports[n] || u.pathname.includes("_internal")) {
    res.writeHead(404);
    return res.end(
      JSON.stringify({ error: { message: "Ruta no encontrada." } }),
    );
  }
  const headers = { ...req.headers };
  delete headers["x-internal-key"];
  delete headers["x-user-id"];
  const upstream = request(
    {
      hostname: "127.0.0.1",
      port: ports[n],
      method: req.method,
      path: "/" + p.slice(3).join("/") + u.search,
      headers,
      timeout: 10000,
    },
    (response) => {
      res.writeHead(response.statusCode, response.headers);
      response.pipe(res);
    },
  );
  upstream.on("timeout", () => upstream.destroy());
  upstream.on("error", () => {
    if (!res.headersSent)
      res.writeHead(503, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: {
          message: "Este servicio no está disponible. Intenta de nuevo.",
        },
      }),
    );
  });
  req.pipe(upstream);
}).listen(port, host, () => console.log(`API: http://${host}:${port}`));
