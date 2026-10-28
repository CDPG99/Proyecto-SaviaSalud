import { before, after, test } from "node:test";
import { createServer } from "node:net";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import "../shared/config.js";
const env = {
  ...process.env,
  DB_PREFIX: `${process.env.DB_PREFIX || "virelia"}_integration`,
  GATEWAY_PORT: "4100",
  AFILIADOS_PORT: "4101",
  CITAS_PORT: "4102",
  DOCUMENTOS_PORT: "4103",
  NOTIFICACIONES_PORT: "4104",
  ATENCION_PORT: "4105",
  SMTP_HOST: "",
};
let app;
const base = "http://127.0.0.1:4100/api";
async function call(
  service,
  path = "/",
  { method = "GET", body, cookie } = {},
) {
  const res = await fetch(base + "/" + service + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const isPdf = res.headers.get("content-type")?.includes("application/pdf");
  return {
    status: res.status,
    cookie: res.headers.get("set-cookie")?.split(";")[0],
    body: isPdf ? Buffer.from(await res.arrayBuffer()) : await res.json(),
  };
}
async function register(label) {
  const suffix = `${Date.now()}${Math.random().toString(16).slice(2, 8)}`;
  const result = await call("afiliados", "/registro", {
    method: "POST",
    body: {
      email: `${label}${suffix}@example.test`,
      password: "Prueba123!",
      nombres: label,
      apellidos: "Prueba",
      tipoDocumento: "CC",
      documento: suffix,
      nacimiento: "1995-05-12",
      telefono: "3001234567",
      direccion: "Calle ficticia 10",
      ciudad: "Bogotá",
      consentimiento: true,
    },
  });
  assert.equal(result.status, 201);
  return result;
}
before(async () => {
  const init = spawn(process.execPath, ["scripts/init-db.mjs"], {
    env,
    stdio: "pipe",
  });
  let log = "";
  init.stderr.on("data", (c) => (log += c));
  const [code] = await once(init, "exit");
  assert.equal(code, 0, log);
  app = spawn(process.execPath, ["scripts/dev.mjs"], { env, stdio: "pipe" });
  app.stderr.on("data", (c) => (log += c));
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      const results = await Promise.all(
        ["afiliados", "citas", "documentos", "notificaciones", "atencion"].map(
          (n) => fetch(base + "/" + n + "/health"),
        ),
      );
      if (results.every((r) => r.ok)) {
        ready = true;
        break;
      }
    } catch {}
    await delay(100);
  }
  assert.ok(ready, log);
});
after(async () => {
  if (app && app.exitCode === null) {
    app.kill("SIGTERM");
    await once(app, "exit");
  }
});
let a, b, appointment, slotId, documentId, caseId;
test("cada uno de los cinco procesos responde health", async () => {
  for (const name of [
    "afiliados",
    "citas",
    "documentos",
    "notificaciones",
    "atencion",
  ])
    assert.equal((await call(name, "/health")).status, 200);
});
test("los registros no se exponen sin sesión", async () => {
  for (const name of [
    "afiliados",
    "citas",
    "documentos",
    "notificaciones",
    "atencion",
  ])
    assert.equal(
      (await call(name, name === "afiliados" ? "/me" : "/")).status,
      401,
    );
  assert.equal(
    (await call("afiliados", "/_internal/usuarios/falso")).status,
    404,
  );
});
test("registro abre sesión y no devuelve la contraseña", async () => {
  a = await register("Ana");
  b = await register("Luisa");
  assert.ok(a.cookie);
  assert.equal(a.body.data.password_hash, undefined);
  assert.equal(
    (await call("afiliados", "/me", { cookie: a.cookie })).body.data.nombres,
    "Ana",
  );
});
test("datos de contacto y beneficiario pertenecen a la cuenta", async () => {
  assert.equal(
    (
      await call("afiliados", "/me", {
        method: "PATCH",
        cookie: a.cookie,
        body: {
          telefono: "3007654321",
          direccion: "Calle ficticia 20",
          ciudad: "Medellín",
        },
      })
    ).status,
    200,
  );
  const member = await call("afiliados", "/beneficiarios", {
    method: "POST",
    cookie: a.cookie,
    body: {
      nombre: "Integrante Ficticio",
      documento: "TESTFAMILIA" + Date.now(),
      parentesco: "Hijo/a",
      nacimiento: "2015-01-02",
    },
  });
  assert.equal(member.status, 201);
  assert.equal(
    (
      await call("afiliados", `/beneficiarios/${member.body.data.id}`, {
        method: "DELETE",
        cookie: b.cookie,
      })
    ).status,
    404,
  );
  assert.equal(
    (await call("afiliados", "/beneficiarios", { cookie: b.cookie })).body.data
      .length,
    0,
  );
});
test("reserva concurrente permite solo una cita por horario", async () => {
  const slots = (await call("citas", "/disponibilidad", { cookie: a.cookie }))
    .body.data;
  assert.ok(slots.length);
  slotId = slots[0].id;
  const results = await Promise.all([
    call("citas", "/", { method: "POST", cookie: a.cookie, body: { slotId } }),
    call("citas", "/", { method: "POST", cookie: b.cookie, body: { slotId } }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  const winner = results[0].status === 201 ? a : b;
  appointment = {
    id: results.find((r) => r.status === 201).body.data.id,
    owner: winner,
    other: winner === a ? b : a,
  };
});
test("reagendar y cancelar solo permiten actuar al titular", async () => {
  assert.equal(
    (
      await call("citas", `/${appointment.id}/cancelar`, {
        method: "PATCH",
        body: {},
        cookie: appointment.other.cookie,
      })
    ).status,
    404,
  );
  const next = (
    await call("citas", "/disponibilidad", { cookie: appointment.owner.cookie })
  ).body.data[0].id;
  assert.equal(
    (
      await call("citas", `/${appointment.id}/reagendar`, {
        method: "PATCH",
        body: { slotId: next },
        cookie: appointment.owner.cookie,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await call("citas", `/${appointment.id}/cancelar`, {
        method: "PATCH",
        body: {},
        cookie: appointment.owner.cookie,
      })
    ).status,
    200,
  );
  const slots = (await call("citas", "/disponibilidad", { cookie: a.cookie }))
    .body.data;
  assert.ok(slots.some((s) => s.id === next));
});
test("documentos se generan para el titular y descargan PDF real", async () => {
  const doc = await call("documentos", "/", {
    method: "POST",
    cookie: a.cookie,
    body: { tipo: "Certificado de afiliación" },
  });
  assert.equal(doc.status, 201);
  documentId = doc.body.data.id;
  assert.equal(
    (await call("documentos", `/${documentId}/pdf`, { cookie: b.cookie }))
      .status,
    404,
  );
  const pdf = await call("documentos", `/${documentId}/pdf`, {
    cookie: a.cookie,
  });
  assert.equal(pdf.body.subarray(0, 5).toString(), "%PDF-");
});
test("autorizaciones e historia se reciben sin fingir aprobación", async () => {
  const d = await call("documentos", "/", {
    method: "POST",
    cookie: a.cookie,
    body: {
      tipo: "Autorización",
      detalle: "Solicitud de prueba para consultar autorización de ejemplo.",
    },
  });
  assert.equal(d.body.data.estado, "Solicitud recibida");
  assert.equal(
    (
      await call("documentos", "/", {
        method: "POST",
        cookie: a.cookie,
        body: { tipo: "Orden emitida", detalle: "No permitido" },
      })
    ).status,
    400,
  );
});
test("PQRS genera radicado, conserva seguimiento y aísla el caso", async () => {
  const result = await call("atencion", "/", {
    method: "POST",
    cookie: a.cookie,
    body: {
      tipo: "Petición",
      asunto: "Consulta de ejemplo",
      descripcion: "Quiero orientación de prueba sobre un trámite del portal.",
    },
  });
  assert.equal(result.status, 201);
  assert.match(result.body.data.radicado, /^VIR-/);
  caseId = result.body.data.id;
  assert.equal(
    (await call("atencion", `/${caseId}`, { cookie: b.cookie })).status,
    404,
  );
  assert.equal(
    (
      await call("atencion", `/${caseId}/mensajes`, {
        method: "POST",
        cookie: a.cookie,
        body: { mensaje: "Información adicional para mi solicitud de prueba." },
      })
    ).status,
    201,
  );
  assert.equal(
    (await call("atencion", `/${caseId}`, { cookie: a.cookie })).body.data
      .mensajes.length,
    1,
  );
});
test("eventos llegan a la bandeja y conservan preferencia de correo", async () => {
  let notices = [];
  for (let i = 0; i < 40; i++) {
    notices = (await call("notificaciones", "/", { cookie: a.cookie })).body
      .data;
    if (notices.some((n) => n.titulo.includes("certificado"))) break;
    await delay(150);
  }
  assert.ok(notices.some((n) => n.titulo.includes("certificado")));
  assert.ok(notices.every((n) => n.email_status === "Sin configurar"));
  assert.equal(
    (
      await call("notificaciones", "/" + notices[0].id, {
        method: "PATCH",
        body: {},
        cookie: b.cookie,
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await call("notificaciones", "/leer-todas", {
        method: "PATCH",
        body: {},
        cookie: a.cookie,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await call("notificaciones", "/preferencias", {
        method: "PATCH",
        body: { emailEnabled: false },
        cookie: a.cookie,
      })
    ).status,
    200,
  );
  assert.equal(
    (await call("notificaciones", "/preferencias", { cookie: a.cookie })).body
      .data.emailEnabled,
    false,
  );
});
test("logout revoca el token y rechaza la sesión anterior", async () => {
  await call("afiliados", "/logout", {
    method: "POST",
    body: {},
    cookie: a.cookie,
  });
  assert.equal((await call("citas", "/", { cookie: a.cookie })).status, 401);
});

test("eventos son idempotentes y el correo usa un SMTP local real", async () => {
  const delivered = [];
  const sockets = new Set();
  const smtp = createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.write("220 local.test ESMTP ready\r\n");
    let buffer = "",
      data = false,
      message = "";
    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      let end;
      while ((end = buffer.indexOf("\r\n")) >= 0) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (data) {
          if (line === ".") {
            data = false;
            delivered.push(message);
            message = "";
            socket.write("250 accepted\r\n");
          } else message += line + "\n";
        } else if (/^EHLO|^HELO/.test(line))
          socket.write("250-local.test\r\n250 PIPELINING\r\n");
        else if (/^DATA/.test(line)) {
          data = true;
          socket.write("354 send data\r\n");
        } else if (/^QUIT/.test(line)) {
          socket.end("221 bye\r\n");
        } else socket.write("250 ok\r\n");
      }
    });
  });
  smtp.listen(42525, "127.0.0.1");
  await once(smtp, "listening");
  const worker = spawn(
    process.execPath,
    ["services/notificaciones/src/server.js"],
    {
      env: {
        ...env,
        NOTIFICACIONES_PORT: "5104",
        SMTP_HOST: "127.0.0.1",
        SMTP_PORT: "42525",
        SMTP_SECURE: "false",
        SMTP_USER: "",
        SMTP_POLL_MS: "200",
      },
      stdio: "pipe",
    },
  );
  worker.stderr.on("data", () => {});
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      try {
        if ((await fetch("http://127.0.0.1:5104/health")).ok) {
          ready = true;
          break;
        }
      } catch {}
      await delay(100);
    }
    assert.ok(ready);
    const eventId = randomUUID(),
      payload = {
        id: eventId,
        userId: b.body.data.id,
        title: "Comprobación SMTP",
        message: "Aviso de prueba interno.",
        link: "notificaciones",
      };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": env.INTERNAL_API_KEY,
      },
      body: JSON.stringify(payload),
    };
    assert.equal(
      (
        await fetch("http://127.0.0.1:5104/_internal/eventos", {
          ...options,
          headers: { ...options.headers, "X-Internal-Key": "incorrecta" },
        })
      ).status,
      401,
    );
    await fetch("http://127.0.0.1:5104/_internal/eventos", options);
    await fetch("http://127.0.0.1:5104/_internal/eventos", options);
    let match;
    for (let i = 0; i < 100; i++) {
      const notices = (await call("notificaciones", "/", { cookie: b.cookie }))
        .body.data;
      const found = notices.filter((n) => n.titulo === "Comprobación SMTP");
      assert.ok(found.length <= 1);
      match = found[0];
      if (match?.email_status === "Enviado") break;
      await delay(100);
    }
    assert.equal(match?.email_status, "Enviado");
    assert.equal(delivered.filter((m) => m.includes("Subject:")).length, 1);
  } finally {
    worker.kill("SIGTERM");
    await once(worker, "exit");
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => smtp.close(resolve));
  }
});

test("MySQL conserva los datos y la sesión al reiniciar los servicios", async () => {
  app.kill("SIGTERM");
  await once(app, "exit");
  app = spawn(process.execPath, ["scripts/dev.mjs"], { env, stdio: "pipe" });
  app.stderr.on("data", () => {});
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      const results = await Promise.all(
        ["afiliados", "citas", "documentos", "notificaciones", "atencion"].map(
          (n) => fetch(base + "/" + n + "/health"),
        ),
      );
      if (results.every((r) => r.ok)) {
        ready = true;
        break;
      }
    } catch {}
    await delay(100);
  }
  assert.ok(ready);
  assert.equal(
    (await call("afiliados", "/me", { cookie: b.cookie })).body.data.id,
    b.body.data.id,
  );
  const login = await call("afiliados", "/login", {
    method: "POST",
    body: { email: a.body.data.email, password: "Prueba123!" },
  });
  assert.equal(login.status, 200);
  assert.ok(
    (await call("documentos", "/", { cookie: login.cookie })).body.data.some(
      (d) => d.id === documentId,
    ),
  );
  assert.equal(
    (await call("atencion", `/${caseId}`, { cookie: login.cookie })).body.data
      .mensajes.length,
    1,
  );
});
