import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { importContent } from "../services/adminService";

async function main() {
  const filePath = process.argv[2] ? resolve(process.argv[2]) : resolve("src/data/seed-content.json");
  const raw = readFileSync(filePath, "utf8");
  const payload = JSON.parse(raw) as { sourceName?: string };

  const result = await importContent({
    ...(payload as Record<string, unknown>),
    sourceName: payload.sourceName || filePath,
  } as Parameters<typeof importContent>[0]);

  console.log(JSON.stringify({ success: true, result }, null, 2));
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});