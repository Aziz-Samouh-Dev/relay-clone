import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../server/worker.mjs';

test('health is public, database independent and does not disclose bindings or secrets',async()=>{
  const response=await worker.fetch(new Request('https://lumina.test/api/health'),{ORDER_SECRET:'must-not-appear'});
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{ok:true,service:'lumina-api'});
  assert.equal(response.headers.get('cache-control'),'no-store');
});

test('non-API routes delegate unchanged to existing static assets',async()=>{
  for(const path of ['/','/fr/','/subscription/','/fr/checkout/','/robots.txt','/sitemap.xml','/assets/app.js','/missing-page/']){
    const req=new Request('https://lumina.test'+path);
    const expected=new Response(path,{status:path==='/missing-page/'?404:200});
    const response=await worker.fetch(req,{ASSETS:{fetch:request=>{assert.equal(request,req);return expected;}}});
    assert.equal(response,expected);
  }
});

test('Wrangler targets existing resources and keeps API worker-first',()=>{
  const config=JSON.parse(fs.readFileSync(new URL('../wrangler.jsonc',import.meta.url)));
  assert.equal(config.name,'relay-clone');
  assert.equal(config.d1_databases[0].database_id,'907cf85d-f371-41ab-aeaf-aeb5edac386c');
  assert.equal(config.d1_databases[0].binding,'DB');
  assert.equal(config.r2_buckets[0].binding,'INVOICES');
  assert.equal(config.r2_buckets[0].bucket_name,'lumina-invoices');
  assert.deepEqual(config.assets.run_worker_first,['/api/*']);
  assert.equal(config.assets.directory,'./dist');
});
