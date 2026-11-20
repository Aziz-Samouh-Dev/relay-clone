import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname,'../dist');
const manifest = JSON.parse(await fs.readFile(path.resolve(import.meta.dirname,'../mirror-manifest.json'),'utf8'));
const errors = [];
let references = 0;
for (const entry of manifest.records) {
  const file = path.join(root, entry.file);
  if (!(await fs.stat(file).catch(()=>null))?.size) errors.push(`Missing or empty: ${entry.file}`);
  if (entry.type !== 'html') continue;
  const html = await fs.readFile(file,'utf8');
  for (const match of html.matchAll(/(?:href|src|poster)=["']([^"']+)["']/g)) {
    const ref = match[1];
    if (!ref.startsWith('/') || ref.startsWith('//')) continue;
    const url = new URL(ref,'https://local.example');
    let local = decodeURIComponent(url.pathname).replace(/^\//,'');
    if (!local || local.endsWith('/')) local += 'index.html';
    else if (!path.extname(local)) local += '/index.html';
    references++;
    if (!await fs.stat(path.join(root,local)).catch(()=>null)) errors.push(`${entry.route}: broken reference ${ref}`);
  }
}
const script = manifest.records.find(x=>x.type==='js');
const js = await fs.readFile(path.join(root,script.file),'utf8');
for (const feature of ['scrollTrigger','data-pricing','data-filter','data-contact','data-quote-next','data-accent','data-mode','data-parallax-image']) {
  if (!js.includes(feature)) errors.push(`Missing interaction: ${feature}`);
}
if (manifest.failures.length) errors.push(...manifest.failures.map(x=>`Download failed: ${x.route}`));
if (errors.length) { console.error(errors.join('\n')); process.exitCode=1; }
else console.log(`PASS: ${manifest.records.filter(x=>x.type==='html').length} pages, ${manifest.records.length} files, ${references} local references. Animation and interaction bundle present.`);
