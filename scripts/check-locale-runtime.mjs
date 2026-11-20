import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const locale=await fs.readFile(new URL('../dist/assets/locale.js',import.meta.url),'utf8');
const queue=[];let active=false,callback;
const textNode={nodeType:3,parentElement:{closest:()=>null}};
let value='6 guides';
Object.defineProperty(textNode,'nodeValue',{get:()=>value,set:v=>{value=v;if(active)queue.push({type:'characterData',target:textNode});}});
const body={nodeType:1,matches:()=>false,hasAttribute:()=>false,childNodes:[textNode]};
const context={window:{},location:{pathname:'/fr/subscription/',search:'',hash:''},document:{documentElement:{lang:'fr-CA'},querySelector:()=>null,body},Node:{TEXT_NODE:3,ELEMENT_NODE:1,DOCUMENT_NODE:9},MutationObserver:class{constructor(cb){callback=cb;}observe(){active=true;}disconnect(){active=false;queue.length=0;}}};
vm.runInNewContext(locale,context,{timeout:1000});
assert.equal(value,'6 guides');
for(const input of ['6 guides','80 total','2 simultaneous streams']){
 textNode.nodeValue=input;
 let passes=0;while(queue.length){assert.ok(++passes<5,'Translation observer did not settle');callback(queue.splice(0));}
 assert.equal(queue.length,0);
 assert.equal(context.window.LuminaLocale.text(value),value,'Translation must be idempotent');
}
const app=await fs.readFile(new URL('../source/app.js',import.meta.url),'utf8');
const themeCode=app.slice(0,app.indexOf('  const reduced='))+'})();';
for(const saved of [null,'system','light','dark']){
 let systemLight=true,onSystemChange,onClick;
 const root={lang:'fr-CA',dataset:{}},attrs={};
 const button={setAttribute:(k,v)=>attrs[k]=v,addEventListener:(e,cb)=>onClick=cb};
 const media={get matches(){return systemLight;},addEventListener:(e,cb)=>onSystemChange=cb};
 const storage=new Map(saved?[['lumina:theme',saved]]:[]);
 const c={window:{},document:{documentElement:root,querySelector:s=>s==='.theme-toggle'?button:null},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},matchMedia:()=>media,Intl};
 vm.runInNewContext(themeCode,c,{timeout:1000});
 assert.equal(root.dataset.theme,saved==='dark'?'dark':'light');
 systemLight=false;onSystemChange();
 assert.equal(root.dataset.theme,saved==='light'?'light':'dark');
 onClick();assert.ok(['system','light','dark'].includes(storage.get('lumina:theme')));
 for(let i=0;i<3&&root.dataset.themePreference!=='system';i++)onClick();
 systemLight=true;onSystemChange();assert.equal(root.dataset.theme,'light');
}
console.log('PASS: French observer settles, translations are idempotent, system theme follows OS changes, manual choices persist and can return to system.');
