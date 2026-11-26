import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const output = resolve(scriptDirectory, '../src/environments/environment.generated.ts');
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080/api/v1';

try {
  new URL(apiBaseUrl);
} catch {
  throw new Error('API_BASE_URL debe ser una URL válida.');
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, `export const environment = { apiBaseUrl: ${JSON.stringify(apiBaseUrl.replace(/\/$/, ''))} };\n`, 'utf8');
