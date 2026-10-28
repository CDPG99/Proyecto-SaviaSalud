import mysql from "mysql2/promise";
import { dbConfig, dbPrefix, names } from "../shared/config.js";
if (!/^[a-zA-Z0-9_]+$/.test(dbConfig.user))
  throw new Error("DB_USER solo admite letras, números y guion bajo.");
if (!process.env.MYSQL_ROOT_PASSWORD)
  throw new Error(
    "Configura MYSQL_ROOT_PASSWORD con la contraseña de tu MySQL local.",
  );
const c = await mysql.createConnection({
  ...dbConfig,
  user: "root",
  password: process.env.MYSQL_ROOT_PASSWORD,
});
try {
  const account = `${mysql.escape(dbConfig.user)}@'%'`;
  await c.query(
    `CREATE USER IF NOT EXISTS ${account} IDENTIFIED BY ${mysql.escape(dbConfig.password)}`,
  );
  for (const suffix of ["", "_integration", "_e2e"])
    for (const name of names) {
      const schema = `${dbPrefix}${suffix}_${name}`;
      await c.query(
        `CREATE DATABASE IF NOT EXISTS \`${schema}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      await c.query(`GRANT ALL PRIVILEGES ON \`${schema}\`.* TO ${account}`);
    }
  console.log("Usuario de aplicación y bases principal/de pruebas preparados.");
} finally {
  await c.end();
}
