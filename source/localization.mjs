import fs from 'node:fs/promises';
const inventory=JSON.parse(await fs.readFile(new URL('./fr-inventory.json',import.meta.url),'utf8'));
const lines=(await fs.readFile(new URL('./fr-content.txt',import.meta.url),'utf8')).split(/\r?\n/).filter(Boolean);
const indexed=new Map(lines.map(line=>{const i=line.indexOf('|');return [Number(line.slice(0,i)),line.slice(i+1)];}));
export const frenchDictionary=Object.fromEntries(inventory.filter(x=>indexed.has(x.id)).map(x=>[x.en,indexed.get(x.id)]));
const fixed=new Set(['en_CA','Lumina','Stream','Lumina Stream','lumina stream','Duck','Edge','Raccoon','Trex','Ciné Pack','CAD','Canada','IPTV','FAQ','Journal','Contact','Interac','Fire TV','Android TV','Apple TV','Samsung & LG','iOS & Android','Windows & Mac','© 2026 Lumina Stream.']);
export const missingFrench=new Set();
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function translate(s,record=true){const key=decode(String(s)).trim();if(frenchDictionary[key]!==undefined)return frenchDictionary[key];if(/^\$[\d.,]+ CAD$/.test(key))return key.slice(1,-4).replace('.',',')+' $ CAD';if(fixed.has(key)||!/[A-Za-z]/.test(key)||key.startsWith('#')||key.includes('@')||/^(?:https?:|index,|noindex,|summary_large_image|website|article|width=|text\/)/.test(key))return key;if(record)missingFrench.add(key);return key;}
const frPath=p=>p.startsWith('/assets/')||p.startsWith('/fr/')?p:'/fr'+p;
export function translatePage(html,route,origin){
 let source=html.replace(/<option([^>]*)>([^<]*)<\/option>/g,(all,attrs,text)=>/\bvalue=/.test(attrs)?all:`<option${attrs} value="${escape(decode(text))}">${text}</option>`);
 let result='';
 const tokens=source.match(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<[^>]+>|[^<]+/gi)||[];
 for(let token of tokens){
  if(/^<script/i.test(token)){
   if(token.includes('application/ld+json')){token=token.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/i,(_,start,json,end)=>{const transform=(v,key='')=>{if(Array.isArray(v))return v.map(x=>transform(x,key));if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,transform(x,k)]));if(typeof v!=='string')return v;if(key==='inLanguage')return 'fr-CA';if(['name','headline','description','text'].includes(key))return translate(v,false);if(['url','@id','item','mainEntityOfPage'].includes(key)&&v.startsWith(origin)&&!v.includes('/assets/')&&!v.endsWith('#organization'))return origin+frPath(v.slice(origin.length)||'/');return v;};return start+JSON.stringify(transform(JSON.parse(json))).replaceAll('<','\\u003c')+end;});}
   result+=token;continue;
  }
  if(/^<style/i.test(token)){result+=token;continue;}
  if(token.startsWith('<')){
   token=token.replace(/\b(placeholder|alt|aria-label|title|content)="([^"]*)"/g,(_,attr,value)=>`${attr}="${escape(translate(value))}"`);
   token=token.replace(/href="(\/[^"#]*)"/g,(_,value)=>`href="${frPath(value)}"`);
   result+=token;
  }else{const leading=token.match(/^\s*/)[0],trailing=token.match(/\s*$/)[0];result+=leading+escape(translate(token))+trailing;}
 }
 result=result.replace('<html lang="en-CA">','<html lang="fr-CA">').replaceAll('content="en_CA"','content="fr_CA"');
 result=result.replace(/(<a class="language-toggle"[^>]*href=")[^"]+("[^>]*>)[^<]+/,`$1${route}$2EN`).replace('lang="fr" aria-label="View this site in English"','lang="en" aria-label="View this site in English"');
 result=result.replace(/<link rel="canonical" href="[^"]+">/,`<link rel="canonical" href="${origin}/fr${route}">`);
 result=result.replaceAll('—',', ').replaceAll('&#8212;',', ').replaceAll('&mdash;',', ');
 return result;
}
export function alternateLinks(route,origin){return `<link rel="alternate" hreflang="en-CA" href="${origin+route}"><link rel="alternate" hreflang="fr-CA" href="${origin}/fr${route}"><link rel="alternate" hreflang="x-default" href="${origin+route}">`;}
