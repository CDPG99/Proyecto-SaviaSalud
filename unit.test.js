import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  tokenHash,
  equalSecret,
  cookieToken,
  sessionCookie,
} from "../shared/security.js";
import { text, email, date, choice, contact } from "../shared/validation.js";
import { documentPdf } from "../services/documentos/src/pdf.js";
test("las contraseñas no se almacenan en texto y se verifican", () => {
  const hash = hashPassword("Password123!");
  assert.notEqual(hash, "Password123!");
  assert.equal(verifyPassword("Password123!", hash), true);
  assert.equal(verifyPassword("Incorrecta", hash), false);
  assert.notEqual(hash, hashPassword("Password123!"));
});
test("sesiones y secretos comparan solo valores válidos", () => {
  assert.equal(equalSecret("", ""), false);
  assert.equal(equalSecret("abc", "abc"), true);
  assert.equal(equalSecret("a", "b"), false);
  assert.equal(tokenHash("token").length, 64);
  assert.equal(
    cookieToken({ headers: { cookie: "otra=1; virelia_session=abc123" } }),
    "abc123",
  );
  assert.equal(cookieToken({ headers: {} }), "");
  assert.match(sessionCookie("x"), /HttpOnly; SameSite=Lax/);
});
for (const [name, fn] of [
  ["correo", () => email("no-correo")],
  ["fecha imposible", () => date("2026-02-30")],
  ["fecha futura", () => date("2999-01-01")],
  ["texto vacío", () => text("", "Nombre")],
  ["opción desconocida", () => choice("Otro", ["Uno"], "Tipo")],
  [
    "teléfono incorrecto",
    () =>
      contact({ telefono: "letras", direccion: "Calle 1", ciudad: "Bogotá" }),
  ],
])
  test(`validación rechaza ${name}`, () => assert.throws(fn));
test("correo normalizado y fecha real aceptados", () => {
  assert.equal(email(" ANA@EXAMPLE.TEST "), "ana@example.test");
  assert.equal(date("2000-02-29"), "2000-02-29");
});
test("el PDF descargable se genera con cabecera PDF", async () => {
  const b = await documentPdf(
    {
      id: "ejemplo",
      tipo: "Certificado de afiliación",
      titulo: "Certificado de afiliación",
      estado: "Disponible",
    },
    {
      nombres: "Ana",
      apellidos: "Prueba",
      tipoDocumento: "CC",
      documento: "DEMO1",
      estado: "Activo",
      regimen: "Subsidiado",
    },
  );
  assert.equal(b.subarray(0, 5).toString(), "%PDF-");
  assert.ok(b.length > 1000);
});

test("PDF envuelve texto largo sin desbordar sus páginas", async () => {
  const { PDFDocument } = await import("pdf-lib");
  const buffer = await documentPdf(
    {
      id: "largo",
      tipo: "Autorización",
      titulo: "Solicitud de autorización",
      estado: "Solicitud recibida",
      detalle: "Texto de ejemplo ".repeat(700),
    },
    {
      nombres: "Ana",
      apellidos: "Prueba",
      tipoDocumento: "CC",
      documento: "DEMO1",
    },
  );
  const doc = await PDFDocument.load(buffer);
  assert.ok(doc.getPageCount() > 1);
});
