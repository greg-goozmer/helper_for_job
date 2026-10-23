import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const errors = [];
async function walk(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(item.name)) continue;
    const filename = path.join(directory, item.name);
    if (item.isDirectory()) await walk(filename);
    else if (item.name.endsWith('.md')) {
      const text = await readFile(filename, 'utf8');
      for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
        const target = match[1].split('#')[0];
        if (!target || /^[a-z]+:|^\/\//i.test(target)) continue;
        try { await access(path.resolve(path.dirname(filename), decodeURIComponent(target))); }
        catch { errors.push(`${path.relative(root, filename)} -> ${target}`); }
      }
    }
  }
}
await walk(root);
const manifest = JSON.parse(await readFile(path.join(root, 'docs/document-manifest.json'), 'utf8'));
for (const item of manifest.documents) {
  try { await access(path.join(root, item.path)); } catch { errors.push(`manifest -> ${item.path}`); }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Документация: ссылки и ${manifest.documents.length} записей манифеста проверены.`);
