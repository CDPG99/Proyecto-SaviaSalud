import mysql from "mysql2/promise";
import {
  dbConfig,
  internalKey,
  names,
  databaseName,
} from "../shared/config.js";
console.log(`Node: ${process.version}`);
console.log(
  `Clave interna: ${internalKey.length >= 24 ? "configurada" : "falta ejecutar npm run setup"}`,
);
let c;
try {
  c = await mysql.createConnection(dbConfig);
  await c.ping();
  console.log("Conexión MySQL: correcta");
  for (const n of names) {
    const [r] = await c.query(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME=?",
      [databaseName(n)],
    );
    console.log(
      `${n}: ${r.length ? "base disponible" : "ejecuta npm run db:init"}`,
    );
  }
} catch (e) {
  console.error(
    `Conexión MySQL: ${e.code}. Revisa .env y que el servidor esté encendido.`,
  );
  process.exitCode = 1;
} finally {
  if (c) await c.end();
}
