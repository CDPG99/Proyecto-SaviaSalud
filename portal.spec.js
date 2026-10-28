import { test, expect } from "@playwright/test";
test("experiencia pública: navegación, lista, asistente y preguntas", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Cuidarte empieza",
  );
  if (process.env.QA_SCREENSHOTS)
    await page.screenshot({
      path: `/tmp/virelia-inicio-${info.project.name}.png`,
      fullPage: true,
    });
  await page.goto("/#/medicamentos");
  await page.getByRole("checkbox").first().check();
  await expect(page.getByText("1 de 3 pasos preparados")).toBeVisible();
  await page.goto("/#/domiciliaria");
  await page
    .getByRole("button", {
      name: "¿Quieres información general sobre atención en casa?",
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Información general" }),
  ).toBeVisible();
  await page.goto("/#/ayuda");
  await page.getByLabel("Buscar una pregunta").fill("certificado");
  await page.locator("summary").first().click();
  await expect(page.locator("details").first()).toHaveAttribute("open", "");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});
test("cuenta, perfil, cita, PDF, PQRS y avisos conectados a MySQL", async ({
  page,
}, info) => {
  await page.goto("/#/registro");
  const suffix = Date.now() + Math.random().toString(16).slice(2, 6);
  for (const [label, value] of [
    ["Nombres", "Laura"],
    ["Apellidos", "Prueba"],
    ["Número de documento", String(suffix)],
    ["Fecha de nacimiento", "1995-05-12"],
    ["Teléfono", "3001234567"],
    ["Dirección", "Calle ficticia 123"],
    ["Ciudad", "Bogotá"],
    ["Correo electrónico", `qa${suffix}@example.test`],
    ["Contraseña", "Virelia2026!"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Crear mi cuenta", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Hola, Laura." }),
  ).toBeVisible();
  await page.goto("/#/perfil");
  await expect(
    page.getByRole("heading", { name: "Mi afiliación", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Ciudad", { exact: true }).fill("Medellín");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Guardamos tus datos");
  await page.goto("/#/citas");
  await page.locator(".slot").first().click();
  await page
    .getByRole("button", { name: "Confirmar cita", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("quedó agendada");
  await expect(page.locator(".appointment")).toHaveCount(1);
  if (process.env.QA_SCREENSHOTS) {
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `/tmp/virelia-citas-${info.project.name}.png`,
      fullPage: true,
    });
  }
  await page.goto("/#/documentos");
  await page
    .getByRole("button", { name: "Generar certificado", exact: true })
    .click();
  await expect(
    page.getByText("Tu certificado está listo para descargar."),
  ).toBeVisible();
  const filePromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Descargar PDF", exact: true })
    .first()
    .click();
  const file = await filePromise;
  expect(file.suggestedFilename()).toMatch(/\.pdf$/);
  await page.goto("/#/atencion");
  await page
    .getByLabel("Asunto", { exact: true })
    .fill("Orientación sobre un trámite");
  await page
    .getByLabel("Cuéntanos tu solicitud")
    .fill(
      "Necesito información de ejemplo para conocer el seguimiento de un trámite.",
    );
  await page
    .getByRole("button", { name: "Radicar solicitud", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("VIR-");
  await page.locator(".case-row").first().click();
  await expect(page.locator(".case-detail")).toContainText(
    "Revisión pendiente",
  );
  await page.goto("/#/notificaciones");
  await expect(
    page.getByRole("heading", { name: "Mis avisos", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Actualizar", exact: true }).click();
  await expect(page.locator(".notification-list")).toContainText(
    "certificado",
    { timeout: 12000 },
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Abrir menú", exact: true }).click();
    await page
      .getByRole("button", { name: "Cerrar sesión", exact: true })
      .click();
  } else
    await page
      .getByRole("button", { name: "Cerrar sesión", exact: true })
      .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Cuidarte empieza",
  );
});
