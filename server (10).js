import { randomUUID } from "node:crypto";
import { db, rows, transaction } from "../../../shared/db.js";
import { startServer, currentUser } from "../../../shared/http.js";
import { text, choice, requireRow } from "../../../shared/validation.js";
import { event, startOutbox } from "../../../shared/events.js";
import { documentPdf } from "./pdf.js";
const pool = db("documentos");
startServer("documentos", async (req, url, b) => {
  const u = await currentUser(req),
    p = url.pathname,
    m = req.method;
  if (p === "/" && m === "GET")
    return {
      data: await rows(
        pool,
        "SELECT * FROM documents WHERE user_id=? ORDER BY created_at DESC",
        [u.id],
      ),
    };
  if (p === "/" && m === "POST") {
    const tipo = choice(
        b.tipo,
        [
          "Certificado de afiliación",
          "Autorización",
          "Copia de orden médica",
          "Historia clínica",
        ],
        "Tipo de documento",
      ),
      id = randomUUID(),
      certificate = tipo === "Certificado de afiliación",
      detalle = certificate
        ? "Certificado de la cuenta de demostración."
        : text(b.detalle, "Detalle de la solicitud", 20, 1500),
      estado = certificate ? "Disponible" : "Solicitud recibida",
      titulo = certificate ? tipo : `Solicitud de ${tipo.toLowerCase()}`;
    await transaction(pool, async (c) => {
      await rows(
        c,
        "INSERT INTO documents(id,user_id,tipo,titulo,estado,detalle)VALUES(?,?,?,?,?,?)",
        [id, u.id, tipo, titulo, estado, detalle],
      );
      await event(
        c,
        u.id,
        certificate
          ? "Tu certificado está disponible"
          : "Recibimos tu solicitud documental",
        titulo,
        "documentos",
      );
    });
    return { status: 201, data: { id, tipo, titulo, estado } };
  }
  const match = p.match(/^\/([^/]+)\/pdf$/);
  if (match && m === "GET") {
    const doc = requireRow(
      (
        await rows(pool, "SELECT * FROM documents WHERE id=? AND user_id=?", [
          match[1],
          u.id,
        ])
      )[0],
    );
    return {
      raw: await documentPdf(doc, u),
      filename: `virelia-${doc.id}.pdf`,
    };
  }
});
startOutbox(pool);
