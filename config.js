import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
try {
  loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url)));
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
export const names = [
  "afiliados",
  "citas",
  "documentos",
  "notificaciones",
  "atencion",
];
export const ports = Object.fromEntries(
  names.map((n, i) => [
    n,
    Number(process.env[`${n.toUpperCase()}_PORT`] || 3001 + i),
  ]),
);
export const internalKey = process.env.INTERNAL_API_KEY || "";
export const host = process.env.HOST || "127.0.0.1";
export const dbPrefix = process.env.DB_PREFIX || "virelia";
if (!/^[a-zA-Z0-9_]+$/.test(dbPrefix))
  throw new Error("DB_PREFIX solo admite letras, números y guion bajo.");
export const databaseName = (n) => `${dbPrefix}_${n}`;
export const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "virelia_app",
  password: process.env.DB_PASSWORD || "",
  charset: "utf8mb4",
  dateStrings: true,
  connectionLimit: 5,
};
