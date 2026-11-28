const { closeSync, openSync, readFileSync } = require("node:fs");
const { join } = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== "--empty")) {
  console.error("Uso: node backend/db/init.js [--empty]");
  process.exit(1);
}

const empty = args.includes("--empty");
const dbPath = join(__dirname, empty ? "marx-local.sqlite" : "marx-demo.sqlite");
const scripts = (empty ? ["schema.sql", "001-users.sql"] : ["schema.sql", "001-users.sql", "seed-demo.sql"])
  .map((file) => readFileSync(join(__dirname, file), "utf8"));

function main() {
  try {
    closeSync(openSync(dbPath, "wx"));
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    console.log("Banco já existe; nenhum dado foi alterado:", dbPath);
    return;
  }

  const db = new DatabaseSync(dbPath, { enableForeignKeyConstraints: true });
  try {
    for (const script of scripts) db.exec(script);
    const check = db.prepare("PRAGMA integrity_check").get();
    if (check.integrity_check !== "ok" || db.prepare("PRAGMA foreign_key_check").all().length > 0) {
      throw new Error("O SQLite encontrou problemas de integridade.");
    }
  } finally {
    db.close();
  }

  console.log("Banco criado:", dbPath);
}

try {
  main();
} catch (error) {
  console.error("Não foi possível inicializar o banco:", error.message);
  process.exitCode = 1;
}
