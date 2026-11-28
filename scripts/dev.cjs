const { spawn, spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const backend = join(root, "backend");
const frontend = join(root, "frontend");
const vite = join(frontend, "node_modules", "vite", "bin", "vite.js");
const frontPort = process.env.FRONTEND_PORT || "5173";

if (!existsSync(vite) || !existsSync(join(backend, "node_modules", "express", "package.json"))) {
  console.error("Instale as dependências na raiz: npm run setup");
  process.exit(1);
}

const init = spawnSync(process.execPath, [join(backend, "db", "init.js")], {
  cwd: root,
  stdio: "inherit",
});
if (init.error || init.status !== 0) {
  if (init.error) console.error(init.error.message);
  process.exit(init.status || 1);
}

const children = new Set();
let stopping = false;

function stop(exitCode) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const process of children) process.kill();
}

function start(label, args, cwd) {
  const child = spawn(process.execPath, args, { cwd, stdio: "inherit" });
  children.add(child);
  child.on("error", (error) => {
    children.delete(child);
    console.error(`${label}: ${error.message}`);
    stop(1);
  });
  child.on("exit", (code) => {
    children.delete(child);
    if (!stopping) {
      console.error(`${label} encerrou; parando o outro processo.`);
      stop(code || 1);
    }
  });
}

process.on("SIGINT", () => stop(130));
process.on("SIGTERM", () => stop(143));

start("Backend", [join(backend, "server.js")], backend);
start("Frontend", [vite, "dev", "--host", "127.0.0.1", "--port", frontPort, "--strictPort"], frontend);

