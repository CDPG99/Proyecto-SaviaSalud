import { spawn } from "node:child_process";
import { names } from "../shared/config.js";
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const c of children) c.kill("SIGTERM");
  process.exitCode = code;
}
for (const file of [
  ...names.map((n) => `services/${n}/src/server.js`),
  "gateway/server.js",
  "vite",
]) {
  const vite = file === "vite";
  const c = spawn(
    process.execPath,
    vite ? ["../node_modules/vite/bin/vite.js", "--host", "127.0.0.1"] : [file],
    {
      cwd: new URL(vite ? "../frontend/" : "../", import.meta.url),
      stdio: "inherit",
      env: process.env,
    },
  );
  children.push(c);
  c.on("error", (e) => {
    console.error(e.message);
    stop(1);
  });
  c.on("exit", (code) => {
    if (!stopping) stop(code || 0);
  });
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
