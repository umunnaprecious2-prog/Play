import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { importContent } from "../services/adminService";

async function main() {
  const filePath = resolve("src/data/levels-content.json");
  const raw = readFileSync(filePath, "utf8");
  const payload = JSON.parse(raw) as Record<string, unknown>;

  const result = await importContent(payload as Parameters<typeof importContent>[0]);

  console.log(JSON.stringify({ success: true, result }, null, 2));
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
