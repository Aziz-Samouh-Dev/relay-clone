import fs from 'node:fs';

const config=JSON.parse(fs.readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
const db=config.d1_databases?.find(b=>b.binding==='DB');
const invoices=config.r2_buckets?.find(b=>b.binding==='INVOICES');
if(config.name!=='relay-clone'||db?.database_name!=='lumina-db'||db?.database_id!=='907cf85d-f371-41ab-aeaf-aeb5edac386c'||invoices?.bucket_name!=='lumina-invoices'){
  throw new Error('Cloudflare configuration must target the existing relay-clone Worker, lumina-db database and lumina-invoices bucket.');
}
console.log('Existing Cloudflare resource configuration checked. No deployment or migration performed.');
