import fs from 'node:fs/promises';
const file='source/build.mjs';let s=await fs.readFile(file,'utf8');
s=s.replace('for(const r of regions)await page','for(const r of regions.filter(r=>r.slug===\'iptv-canada\'))await page');
s=s.replace('<a href="/iptv-quebec/">Quebec & French TV</a><a href="/iptv-montreal/">Montreal setup tips</a><a href="/iptv-toronto/">Toronto setup tips</a>','<a href="/guide/">Setup guides</a><a href="/faq/">Subscription FAQ</a>');
s=s.replace(/<div class="field span-2"><label for="checkout-country">[\s\S]*?<\/select><small>[\s\S]*?<\/small><\/div>/,'<input type="hidden" name="country" value="Canada"><p class="canada-service span-2">Subscriptions for Canada · All prices in CAD</p>');
s=s.replace('class="header-actions">','class="header-actions"><div class="site-preferences"><a class="language-toggle" href="/fr/" data-language-toggle lang="fr" aria-label="Afficher le site en français">FR</a><button class="theme-toggle" type="button" aria-label="Switch to light mode" aria-pressed="false"><span class="theme-sun" aria-hidden="true">☀</span><span class="theme-moon" aria-hidden="true">☾</span></button></div>');
s=s.replace('for(const file of [\'styles.css\',\'app.js\'])','for(const file of [\'styles.css\',\'app.js\'])');
s=s.replace('const noindex=!site.indexing||options.noindex;','const noindex=!site.indexing||options.noindex;');
s=s.replace('<link rel="stylesheet" href="/assets/styles.css">','<script>try{const t=localStorage.getItem("lumina:theme");document.documentElement.dataset.theme=t==="light"?"light":"dark";}catch{document.documentElement.dataset.theme="dark";}</script><link rel="stylesheet" href="/assets/styles.css">');
s=s.replace('await fs.writeFile(dest,storefrontCopy(brandText(html)))',`await fs.writeFile(dest,storefrontCopy(brandText(html)).replaceAll('—',', ').replaceAll('&#8212;',', '))`);
await fs.writeFile(file,s);
let app=await fs.readFile('source/app.js','utf8');app=app.replace("['Country',form.elements.country.value],",'').replaceAll('My country:\\n','').replaceAll("'—'","''");await fs.writeFile('source/app.js',app);
// Remove only obsolete location page files. Paths are verified to stay inside this checkout's dist.
const project=fs.realpath('dist');const root=await project;
for(const route of ['iptv-quebec','iptv-montreal','iptv-toronto']){const target=new URL('../dist/'+route+'/index.html',import.meta.url);const resolved=target.pathname.replace(/^\//,'');if(!resolved.replaceAll('/', '\\').toLowerCase().startsWith(root.toLowerCase()+'\\'))throw Error('Unexpected obsolete page path');await fs.unlink(target).catch(e=>{if(e.code!=='ENOENT')throw e;});}
console.log('Added preference controls and restricted the storefront to Canada.');
