import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base=new URL(process.argv[2]||'http://127.0.0.1:8787');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname),'Smoke checks are local only');
const get=path=>fetch(new URL(path,base),{signal:AbortSignal.timeout(15000)});
for(const path of ['/','/fr/','/subscription/','/fr/subscription/','/checkout/','/fr/checkout/','/blog/','/fr/blog/','/robots.txt','/sitemap.xml','/assets/commerce.js']){
  const response=await get(path);assert.equal(response.status,200,path);
  const file=path.endsWith('/')?path+'index.html':path;
  const actual=Buffer.from(await response.arrayBuffer()),expected=await fs.readFile(new URL('../dist'+file,import.meta.url));
  assert.deepEqual(actual,expected,'Static content changed: '+path);
}
assert.equal((await get('/missing-smoke-page/')).status,404);
const health=await get('/api/health');assert.deepEqual(await health.json(),{ok:true,service:'lumina-api'});
const catalog=await get('/api/catalog');assert.equal((await catalog.json()).currency,'CAD');
const key=crypto.randomUUID(),headers={'Content-Type':'application/json',Origin:base.origin,'X-Lumina-Request':'1','Idempotency-Key':key};
const payload={name:'Local Worker smoke test',email:'smoke@example.invalid',plan:'duck',months:3,screens:2,device:'Fire TV',locale:'fr-CA'};
const create=()=>fetch(new URL('/api/orders',base),{method:'POST',headers,body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
const created=await create();assert.equal(created.status,201);
const {order,accessToken}=await created.json();assert.equal(order.total_cents,5500);assert.equal(order.mode,'test');
const repeated=await create();assert.equal((await repeated.json()).order.public_id,order.public_id);
const orderPath='/api/orders/'+order.public_id,authorized={headers:{Authorization:'Bearer '+accessToken},signal:AbortSignal.timeout(15000)};
assert.equal((await get(orderPath)).status,404);
const detailResponse=await fetch(new URL(orderPath,base),authorized);assert.equal(detailResponse.status,200);const detail=await detailResponse.json();
const pdfUrl=new URL(orderPath+'/invoices/'+detail.invoices[0].id+'/pdf',base);
const pdf=await fetch(pdfUrl,authorized);assert.equal(pdf.status,200);const bytes=Buffer.from(await pdf.arrayBuffer());assert.equal(bytes.subarray(0,4).toString(),'%PDF');
const again=await fetch(pdfUrl,authorized);assert.equal(again.status,200);assert.deepEqual(Buffer.from(await again.arrayBuffer()),bytes);
assert.equal((await get('/api/admin/orders')).status,401);
console.log('PASS: unchanged EN/FR pages, assets, SEO files, 404s, health, catalog, local D1 order/idempotency and authorized R2 invoice round trip. No email or remote request was sent.');
