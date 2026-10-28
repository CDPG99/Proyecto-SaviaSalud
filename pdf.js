import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
export async function documentPdf(doc, user) {
  const pdf = await PDFDocument.create(),
    font = await pdf.embedFont(StandardFonts.Helvetica),
    bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const safe = (s) => String(s).replace(/[^\x20-\x7e\xa0-\xff]/g, "-");
  let page, y;
  function newPage() {
    page = pdf.addPage([595, 842]);
    page.drawRectangle({
      x: 0,
      y: 720,
      width: 595,
      height: 122,
      color: rgb(23 / 255, 79 / 255, 103 / 255),
    });
    page.drawRectangle({
      x: 0,
      y: 714,
      width: 595,
      height: 6,
      color: rgb(245 / 255, 196 / 255, 0),
    });
    page.drawText("VIRELIA", {
      x: 45,
      y: 778,
      size: 26,
      font: bold,
      color: rgb(1, 1, 1),
    });
    page.drawText("PORTAL DE PRÁCTICA", {
      x: 45,
      y: 748,
      size: 12,
      font,
      color: rgb(1, 1, 1),
    });
    page.drawLine({
      start: { x: 45, y: 90 },
      end: { x: 550, y: 90 },
      thickness: 1,
      color: rgb(20 / 255, 87 / 255, 217 / 255),
    });
    page.drawText("Virelia · Demostración sin validez clínica ni legal", {
      x: 45,
      y: 65,
      size: 10,
      font,
    });
    y = 680;
  }
  function draw(row, size) {
    if (y < 125) newPage();
    page.drawText(row, { x: 45, y, size, font });
    y -= size + 10;
  }
  function line(value, size = 12) {
    const text = safe(value);
    let row = "";
    for (const char of text) {
      if (char === "\n") {
        draw(row, size);
        row = "";
        continue;
      }
      if (font.widthOfTextAtSize(row + char, size) > 500) {
        const last = row.lastIndexOf(" ");
        if (last > 0) {
          draw(row.slice(0, last), size);
          row = row.slice(last + 1) + char;
        } else {
          draw(row, size);
          row = char;
        }
      } else row += char;
    }
    if (row) draw(row, size);
  }
  newPage();
  line(doc.titulo, 19);
  line("DOCUMENTO DE DEMOSTRACIÓN - SIN VALIDEZ CLÍNICA NI LEGAL", 10);
  y -= 20;
  line(`Nombre: ${user.nombres} ${user.apellidos}`);
  line(`Documento: ${user.tipoDocumento} ${user.documento}`);
  line(
    `Generado: ${new Date(doc.created_at || Date.now()).toISOString().slice(0, 10)}`,
  );
  line(`Referencia: ${doc.id}`);
  line(`Estado: ${doc.estado}`);
  y -= 14;
  if (doc.tipo === "Certificado de afiliación") {
    line(
      `Afiliación de ejemplo: ${user.estado}. Régimen de ejemplo: ${user.regimen}.`,
    );
    line(
      "Este archivo acredita únicamente el registro de una cuenta de práctica en Virelia. No acredita cobertura de una EPS real.",
    );
  } else {
    line("Constancia de recepción de la solicitud");
    line(doc.detalle);
    line(
      "La recepción de esta solicitud no constituye una autorización ni una orden médica.",
    );
  }
  return Buffer.from(await pdf.save());
}
