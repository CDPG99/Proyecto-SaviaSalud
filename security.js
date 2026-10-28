import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
export function hashPassword(p) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(p, salt, 64).toString("hex")}`;
}
export function verifyPassword(p, stored) {
  const [salt, hash] = stored.split(":");
  const a = scryptSync(p, salt, 64),
    b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
export const tokenHash = (t) => createHash("sha256").update(t).digest("hex");
export const sessionToken = () => randomBytes(32).toString("hex");
export function equalSecret(a, b) {
  const l = Buffer.from(String(a || "")),
    r = Buffer.from(String(b || ""));
  return r.length > 0 && l.length === r.length && timingSafeEqual(l, r);
}
export function cookieToken(req) {
  return (
    (req.headers.cookie || "")
      .split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("virelia_session="))
      ?.slice(16) || ""
  );
}
export function sessionCookie(t, expires = 28800) {
  return `virelia_session=${t}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${expires}${process.env.COOKIE_SECURE === "true" ? "; Secure" : ""}`;
}
