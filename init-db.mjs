import mysql from "mysql2/promise";
import { randomUUID } from "node:crypto";
import { dbConfig, names, databaseName } from "../shared/config.js";
import { schemas } from "../shared/schema.js";
import { hashPassword } from "../shared/security.js";
const c = await mysql.createConnection(dbConfig);
try {
  for (const n of names) {
    await c.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName(n)}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await c.query(`USE \`${databaseName(n)}\``);
    for (const sql of schemas[n]) await c.query(sql);
  }
  await c.query(`USE \`${databaseName("citas")}\``);
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + i);
    for (const [sp, dr, place] of [
      ["Medicina general", "Dra. Laura Gómez", "Centro Virelia Norte"],
      ["Odontología", "Dr. Carlos Ríos", "Centro Virelia Centro"],
      ["Psicología", "Dra. Sara López", "Atención virtual"],
    ])
      for (const h of ["08:00", "09:30", "11:00", "14:30"])
        await c.execute(
          "INSERT IGNORE INTO slots(id,especialidad,profesional,sede,fecha,hora)VALUES(?,?,?,?,?,?)",
          [randomUUID(), sp, dr, place, d.toISOString().slice(0, 10), h],
        );
  }
  if (process.env.SEED_DEMO === "true") {
    await c.query(`USE \`${databaseName("afiliados")}\``);
    const email = process.env.DEMO_EMAIL || "demo@virelia.test";
    const [exists] = await c.execute("SELECT id FROM users WHERE email=?", [
      email,
    ]);
    if (!exists.length)
      await c.execute(
        "INSERT INTO users(id,email,password_hash,nombres,apellidos,tipo_documento,documento,nacimiento,telefono,direccion,ciudad)VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        [
          randomUUID(),
          email,
          hashPassword(process.env.DEMO_PASSWORD || "Virelia2026!"),
          "Mariana",
          "Torres",
          "CC",
          "DEMO10001",
          "1995-05-12",
          "3001234567",
          "Calle de ejemplo 10",
          "Medellín",
        ],
      );
  }
  console.log(
    "Cinco bases y agenda de ejemplo listas; datos existentes conservados.",
  );
} finally {
  await c.end();
}
