// backend/src/applyMigrations.js
const fs = require("fs");
const db = require("./db");

async function apply() {
  const sql = fs.readFileSync(
    __dirname + "/migrations/001_create_tables.sql",
    "utf8"
  );
  await db.query(sql);
  console.log("Migrations applied");
  process.exit(0);
}
apply().catch((err) => {
  console.error(err);
  process.exit(1);
});
