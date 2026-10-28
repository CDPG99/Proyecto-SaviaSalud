import mysql from "mysql2/promise";
import { dbConfig, databaseName } from "./config.js";
const pools = new Map();
export function db(n) {
  if (!pools.has(n))
    pools.set(n, mysql.createPool({ ...dbConfig, database: databaseName(n) }));
  return pools.get(n);
}
export async function rows(pool, sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}
export async function transaction(pool, fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const value = await fn(conn);
    await conn.commit();
    return value;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
export async function closePools() {
  for (const p of pools.values()) await p.end();
  pools.clear();
}
