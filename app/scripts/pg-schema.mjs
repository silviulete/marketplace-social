/**
 * Comută providerul Prisma sqlite ⇄ postgresql (Etapa 11 — deploy, #42).
 * Prisma nu acceptă provider din env, așa că schema se rescrie pe loc:
 *   node scripts/pg-schema.mjs on   → postgresql (înainte de deploy)
 *   node scripts/pg-schema.mjs off  → sqlite (înapoi pentru dev local)
 * Schema rămâne UNA singură — se schimbă doar linia providerului.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SCHEMA = join(dirname(fileURLToPath(import.meta.url)), "..", "prisma", "schema.prisma");
const mode = process.argv[2];
if (mode !== "on" && mode !== "off") {
  console.error("Folosire: node scripts/pg-schema.mjs on|off");
  process.exit(1);
}

const text = readFileSync(SCHEMA, "utf8");
const next =
  mode === "on"
    ? text.replace('provider = "sqlite"', 'provider = "postgresql"')
    : text.replace('provider = "postgresql"', 'provider = "sqlite"');

if (next === text) {
  console.log(`Nimic de schimbat — schema e deja pe ${mode === "on" ? "postgresql" : "sqlite"}.`);
} else {
  writeFileSync(SCHEMA, next);
  console.log(`Schema → ${mode === "on" ? "postgresql" : "sqlite"}. Rulează apoi: npx prisma generate`);
}
