import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);
const origin = 'https://relay-theme.pages.dev';
const root = path.resolve(import.meta.dirname, '../dist');
const pending = new Set(['/']);
const done = new Set();
const records = [];
const failures = [];
function discover(text, type) {
  const refs = [];
  if (type === 'html') {
    for (const m of text.matchAll(/(?:href|src|poster|data-src)=["']([^"']+)["']/g)) refs.push(m[1]);
    for (const m of text.matchAll(/srcset=["']([^"']+)["']/g)) for (const item of m[1].split(',')) refs.push(item.trim().split(/\s+/)[0]);
  }
  for (const m of text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) refs.push(m[1]);
  if (type === 'js') for (const m of text.matchAll(/(?:from\s*|import\s*\(?)["']([^"']+)["']/g)) refs.push(m[1]);
  return refs;
}
async function download(route) {
  done.add(route);
  const url = new URL(route, origin);
  let relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (!relative || relative.endsWith('/')) relative += 'index.html';
  else if (!path.extname(relative)) relative += '/index.html';
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) throw new Error('Invalid path');
  await fs.mkdir(path.dirname(target), { recursive: true });
  try {
    await run('curl.exe', ['--fail','--silent','--show-error','--location','--retry','2',url.href,'--output',target], { maxBuffer: 1024 * 1024 });
    const ext = path.extname(target);
    const type = ext === '.html' ? 'html' : ext === '.css' ? 'css' : ext === '.js' ? 'js' : null;
    const stat = await fs.stat(target);
    records.push({ route, file: relative.replaceAll('\\','/'), bytes: stat.size, type: type || 'asset' });
    if (type) {
      const text = await fs.readFile(target, 'utf8');
      for (const ref of discover(text, type)) {
        if (/^(?:data:|mailto:|tel:|javascript:|#)/.test(ref)) continue;
        let next; try { next = new URL(ref.replaceAll('&amp;', '&'), url); } catch { continue; }
        if (next.origin !== origin) continue;
        next.hash = ''; next.search = '';
        if (!done.has(next.pathname)) pending.add(next.pathname);
      }
    }
    console.log(`${type || 'asset'} ${route} (${stat.size})`);
  } catch (error) { failures.push({ route, error: error.message }); console.error(`FAILED ${route}`); }
}
await fs.mkdir(root, { recursive: true });
while (pending.size) {
  const batch = [...pending].filter(x => !done.has(x)).slice(0, 6);
  if (!batch.length) break;
  for (const route of batch) pending.delete(route);
  await Promise.all(batch.map(download));
}
await fs.writeFile(path.resolve(import.meta.dirname,'../mirror-manifest.json'), JSON.stringify({ origin, created: new Date().toISOString(), records, failures }, null, 2));
console.log(JSON.stringify({ pages: records.filter(x => x.type === 'html').length, files: records.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
