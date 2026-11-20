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
 if(!html.includes(`<html lang="${page.lang||'en-CA'}">`))errors.push(page.route+': language missing');
 if(/—|&mdash;|&#8212;/.test(html))errors.push(page.route+': em dash remains');
 if(/id="checkout-country"|\/iptv-(?:montreal|toronto|quebec)\//.test(html))errors.push(page.route+': obsolete location selector or city link');
 if(!html.includes('hreflang="fr-CA"')||!html.includes('hreflang="en-CA"'))errors.push(page.route+': language alternates missing');
 if(!html.includes('<meta name="robots"'))errors.push(page.route+': robots missing');
 if(manifest.indexing&&!page.noindex&&!html.includes('content="index, follow, max-image-preview:large"'))errors.push(page.route+': indexing unexpectedly blocked');
 if(/\/(?:checkout|order-confirmation)\//.test(page.route)&&!html.includes('content="noindex, follow"'))errors.push(page.route+': transactional page is indexable');
 for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{JSON.parse(match[1]);schemas++;}catch{errors.push(page.route+': malformed JSON-LD');}}
 for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)){
  const ref=m[1];if(!ref.startsWith('/')||ref.startsWith('//'))continue;
  const url=new URL(ref,'https://local.example');let relative=decodeURIComponent(url.pathname).slice(1);if(!relative||relative.endsWith('/'))relative+='index.html';else if(!path.extname(relative))relative+='/index.html';references++;
  if(!(await fs.stat(path.join(dist,relative)).catch(()=>null))?.size)errors.push(page.route+': broken reference '+ref);
 }
 if(/relay-theme\.pages\.dev|tvsline\.org|Luxpaynorth|99\.9%/.test(html))errors.push(page.route+': stale or unverified reference content');
 if(/(?:hero-real|cinema-real|sports-real|journal-(?:iptv|cinema|device|buffering|4k|canada))\.jpg/.test(html))errors.push(page.route+': replaced photography remains');
}
const checkout=await fs.readFile(path.join(dist,'checkout/index.html'),'utf8');
if(JSON.parse(await fs.readFile(path.join(project,'fr-untranslated.json'),'utf8')).length)errors.push('Untranslated French content remains');
if(!checkout.includes('name="country" value="Canada"'))errors.push('Checkout must be fixed to Canada');
if(!checkout.includes('data-copy-transfer="memo"')||!checkout.includes('data-copy-transfer="amount"'))errors.push('Interac reference or amount copy control missing');
if(!checkout.includes('payments@example.com is a placeholder'))errors.push('Missing placeholder payment-recipient notice');
const blog=await fs.readFile(path.join(dist,'blog/index.html'),'utf8');
const journalImages=[...blog.matchAll(/class="article-img"[^>]*><img src="([^"]+)"/g)].map(m=>m[1]);
if(journalImages.length!==6||new Set(journalImages).size!==6)errors.push('Journal must have six distinct article images');
const home=await fs.readFile(path.join(dist,'index.html'),'utf8');
if(!/<h1[^>]*>IPTV for Canada\./.test(home))errors.push('Canada targeting missing from homepage h1');
const frHome=await fs.readFile(path.join(dist,'fr/index.html'),'utf8');
if(!frHome.includes('IPTV pour le Canada.'))errors.push('French Canada targeting missing');
if(!home.includes('"areaServed":{"@type":"Country","name":"Canada","identifier":"CA"}'))errors.push('Canada service area schema missing');
const robots=await fs.readFile(path.join(dist,'robots.txt'),'utf8');
if(manifest.indexing&&(!robots.includes('Allow: /')||robots.includes('Disallow: /')))errors.push('Public crawling blocked');
if(!home.includes('class="device-track"'))errors.push('Animated device banner missing');
const heroImages=[...home.matchAll(/class="hero-slide[^"]*" src="([^"]+)"/g)].map(m=>m[1]);
if(heroImages.length!==3||new Set(heroImages).size!==3)errors.push('Hero requires three dedicated photographs');
if((home.match(/data-hero-scene="\d"/g)||[]).length!==3)errors.push('Hero slide controls missing');
for(const src of heroImages)if(journalImages.includes(src))errors.push('Hero photography repeated in Journal');
if(home.includes('class="preview-bar"'))errors.push('Obsolete preview banner present');
if(/(?:watching-tv|cinema-tv|sports-tv)\.jpg/.test(home))errors.push('Generated imagery still referenced on home');
const app=await fs.readFile(path.join(dist,'assets/app.js'),'utf8');
if(/fetch\(|localStorage\.setItem\([^)]*(?:email|password|name)/.test(app))errors.push('Unexpected network submission or sensitive storage');
const sitemap=await fs.readFile(path.join(dist,'sitemap.xml'),'utf8');
if(sitemap.includes('/checkout/')||sitemap.includes('/order-confirmation/'))errors.push('Transactional pages must not be in sitemap');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`PASS: ${manifest.pages.length} pages, ${references} local references, ${schemas} valid JSON-LD graphs; six unique Journal photos, sales metadata, checkout and sitemap checks passed.`);
