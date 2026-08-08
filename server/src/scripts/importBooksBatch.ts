import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { importContent } from "../services/adminService";

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Usage: tsx src/scripts/importBooksBatch.ts <path-relative-to-server>");
    process.exitCode = 1;
    return;
  }

  const filePath = resolve(fileArg);
  const raw = readFileSync(filePath, "utf8");
  const payload = JSON.parse(raw) as Record<string, unknown>;

  const result = await importContent(payload as Parameters<typeof importContent>[0]);

  console.log(JSON.stringify({ success: true, file: fileArg, result }, null, 2));
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
