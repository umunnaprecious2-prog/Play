import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ensureBootstrapAdmin } from "../services/authService";
import { importContent } from "../services/adminService";

async function main() {
  await ensureBootstrapAdmin();

  const filePath = resolve("src/data/seed-content.json");
  const raw = readFileSync(filePath, "utf8");
  const payload = JSON.parse(raw) as { sourceName?: string };

  const result = await importContent({
    ...(payload as Record<string, unknown>),
    sourceName: payload.sourceName || "starter-seed",
  } as Parameters<typeof importContent>[0]);

  console.log(JSON.stringify({ success: true, result }, null, 2));
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});