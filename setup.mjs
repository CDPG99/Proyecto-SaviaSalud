import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
const file = new URL("../.env", import.meta.url);
let s = existsSync(file)
  ? readFileSync(file, "utf8")
  : readFileSync(new URL("../.env.example", import.meta.url), "utf8");
if (/^INTERNAL_API_KEY=\s*$/m.test(s))
  s = s.replace(
    /^INTERNAL_API_KEY=\s*$/m,
    `INTERNAL_API_KEY=${randomBytes(32).toString("hex")}`,
  );
for (const key of ["DB_PASSWORD", "MYSQL_ROOT_PASSWORD"]) {
  const regex = new RegExp(`^${key}=\\s*$`, "m");
  if (regex.test(s))
    s = s.replace(regex, `${key}=${randomBytes(20).toString("hex")}`);
}
writeFileSync(file, s);
console.log(
  "Configuración .env lista. Revisa los datos MySQL antes de db:init.",
);
