import fs from 'node:fs/promises';
const html=await fs.readFile(new URL('../../tvs-checkout--p-essai.html',import.meta.url),'utf8');
const raw=JSON.parse(html.match(/<script type="application\/json" id="ck-data">([\s\S]*?)<\/script>/)[1]);
const asOf=Date.parse('2026-11-20T00:00:00Z');
const result={source:'https://tvsline.org/checkout/',asOf:'2026-11-20',currency:'CAD',trialPrice:raw.trialPrice,plans:raw.plans.map(p=>({id:p.key,name:p.name,kind:p.kind,note:p.tagline,featured:p.key==='raccoon',months:12,price:0,prices:Object.fromEntries(p.durations.map(d=>[d.months,d.prices.map((price,i)=>p.changeAt&&asOf>=p.changeAt&&d.next[i]>0?d.next[i]:price)]))}))};
for(const p of result.plans)p.price=p.prices[12][0];
await fs.writeFile(new URL('../source/pricing.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
