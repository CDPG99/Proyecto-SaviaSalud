import { randomUUID } from "node:crypto";
import { rows } from "./db.js";
import { internal } from "./http.js";
export async function event(conn, userId, title, message, link) {
  await rows(conn, "INSERT INTO outbox (id,payload) VALUES (?,?)", [
    randomUUID(),
    JSON.stringify({ userId, title, message, link }),
  ]);
}
export function startOutbox(pool) {
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      const pending = await rows(
        pool,
        "SELECT id,payload FROM outbox WHERE delivered=0 ORDER BY created_at LIMIT 20",
      );
      for (const item of pending) {
        try {
          const p =
            typeof item.payload === "string"
              ? JSON.parse(item.payload)
              : item.payload;
          await internal("notificaciones", "/_internal/eventos", {
            method: "POST",
            body: JSON.stringify({ ...p, id: item.id }),
          });
          await rows(pool, "UPDATE outbox SET delivered=1 WHERE id=?", [
            item.id,
          ]);
        } catch {
          break;
        }
      }
    } catch (e) {
      console.error("Eventos:", e.code || e.name);
    } finally {
      running = false;
    }
  }, 2000);
  timer.unref();
  return () => clearInterval(timer);
}
