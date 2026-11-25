import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {LocalD1} from '../server/local.mjs';

test('account migration preserves legacy orders, quotes, claims, invoices and audit rows',async()=>{
 const db=new LocalD1();try{
  for(const name of ['0001_commerce.sql','0002_subscription_delivery.sql','0003_closed_order_reviews.sql','0004_authoritative_payment_state.sql'])db.sqlite.exec(await fs.readFile(new URL('../migrations/'+name,import.meta.url),'utf8'));
  const timestamp='2026-11-25T12:00:00Z';db.sqlite.prepare('INSERT INTO customers VALUES(?,?,?,?)').run('customer','Legacy fixture','legacy@example.invalid',timestamp);
  db.sqlite.prepare("INSERT INTO orders(public_id,customer_id,request_key,request_hash,access_hash,plan_id,plan_name,months,screens,subtotal_cents,tax_label,total_cents,currency,locale,device,mode,created_at) VALUES('order','customer','key','hash','access','duck','Duck',1,1,1500,'Configured',1500,'CAD','en-CA','TV','live',?)").run(timestamp);
  db.sqlite.prepare("INSERT INTO quotes(id,order_id,method,amount,mode,expires_at,created_at) VALUES('quote',1,'interac','15.00','live',?,?)").run(timestamp,timestamp);
  db.sqlite.prepare("INSERT INTO claims(id,order_id,quote_id,request_key,request_hash,method,confirmation,created_at) VALUES('claim',1,'quote','key','hash','interac','legacy-confirmation',?)").run(timestamp);
  db.sqlite.prepare("INSERT INTO invoices(order_id,kind,status,amount_cents,snapshot,created_at) VALUES(1,'proforma','issued',1500,'{}',?)").run(timestamp);
  db.sqlite.prepare("INSERT INTO audit(actor,action,order_id,details,created_at) VALUES('fixture','created',1,'{}',?)").run(timestamp);
  const tables=['customers','orders','quotes','claims','invoices','audit'],before=Object.fromEntries(tables.map(t=>[t,db.sqlite.prepare('SELECT * FROM '+t).all()]));
  db.sqlite.exec(await fs.readFile(new URL('../migrations/0005_payment_accounts.sql',import.meta.url),'utf8'));
  for(const t of tables){const after=db.sqlite.prepare('SELECT * FROM '+t).all();assert.equal(after.length,before[t].length);for(const [i,row]of before[t].entries())for(const [key,value]of Object.entries(row))assert.equal(after[i][key],value,t+'.'+key);}
  const quote=db.sqlite.prepare('SELECT account_id,account_version,account_snapshot FROM quotes').get();assert.equal(quote.account_id,null);assert.equal(quote.account_version,null);assert.equal(quote.account_snapshot,null);assert.equal(db.sqlite.prepare('SELECT COUNT(*) n FROM payment_accounts').get().n,0);assert.equal(db.sqlite.prepare('PRAGMA foreign_key_check').all().length,0);
 }finally{db.close();}
});
