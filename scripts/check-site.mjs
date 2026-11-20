import fs from 'node:fs/promises';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..'),dist=path.join(project,'dist');
const manifest=JSON.parse(await fs.readFile(path.join(project,'site-manifest.json'),'utf8'));
const errors=[],titles=new Set(),descriptions=new Set();let references=0,schemas=0;
for(const page of manifest.pages){
 const file=path.join(dist,page.route.slice(1),'index.html');
 const html=await fs.readFile(file,'utf8');
 if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(page.route+': expected one h1');
 if(titles.has(page.title))errors.push(page.route+': duplicate title');titles.add(page.title);
 if(descriptions.has(page.description))errors.push(page.route+': duplicate description');descriptions.add(page.description);
 if(!html.includes(`rel="canonical" href="${manifest.origin+page.route}"`))errors.push(page.route+': canonical incorrect');
 if(!html.includes('<html lang="en-CA">'))errors.push(page.route+': language missing');
 if(!html.includes('<meta name="robots"'))errors.push(page.route+': robots missing');
 for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{JSON.parse(match[1]);schemas++;}catch{errors.push(page.route+': malformed JSON-LD');}}
 for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)){
  const ref=m[1];if(!ref.startsWith('/')||ref.startsWith('//'))continue;
  const url=new URL(ref,'https://local.example');let relative=decodeURIComponent(url.pathname).slice(1);if(!relative||relative.endsWith('/'))relative+='index.html';else if(!path.extname(relative))relative+='/index.html';references++;
  if(!(await fs.stat(path.join(dist,relative)).catch(()=>null))?.size)errors.push(page.route+': broken reference '+ref);
 }
 if(/relay-theme\.pages\.dev|tvsline\.org|Luxpaynorth|30,000|99\.9%/.test(html))errors.push(page.route+': stale or unverified reference content');
}
const checkout=await fs.readFile(path.join(dist,'checkout/index.html'),'utf8');
if(!checkout.includes('No card information is requested.'))errors.push('Checkout preview notice missing');
const app=await fs.readFile(path.join(dist,'assets/app.js'),'utf8');
if(/fetch\(|localStorage\.setItem\([^)]*(?:email|password|name)/.test(app))errors.push('Unexpected network submission or sensitive storage');
const sitemap=await fs.readFile(path.join(dist,'sitemap.xml'),'utf8');
if(sitemap.includes('/checkout/')||sitemap.includes('/order-confirmation/'))errors.push('Transactional pages must not be in sitemap');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`PASS: ${manifest.pages.length} pages, ${references} local references, ${schemas} valid JSON-LD graphs; unique metadata, checkout preview and sitemap checks passed.`);
