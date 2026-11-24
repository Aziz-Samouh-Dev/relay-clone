import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {LocalD1} from '../server/local.mjs';

test('payment state migration corrects reads of existing stale orders without rewriting history',async()=>{
 const db=new LocalD1();try{
  for(const name of ['0001_commerce.sql','0002_subscription_delivery.sql','0003_closed_order_reviews.sql'])db.sqlite.exec(await fs.readFile(new URL('../migrations/'+name,import.meta.url),'utf8'));
  const created='2026-11-24T12:00:00Z';
  db.sqlite.prepare('INSERT INTO customers VALUES(?,?,?,?)').run('customer','Migration Test','test@example.invalid',created);
  db.sqlite.prepare("INSERT INTO orders(public_id,customer_id,request_key,request_hash,access_hash,plan_id,plan_name,months,screens,subtotal_cents,tax_cents,tax_label,total_cents,currency,locale,device,mode,payment_status,order_status,created_at) VALUES('test','customer','test','test','test','duck','Duck',1,1,2500,0,'Test',2500,'CAD','en-CA','TV','test','awaiting_verification','cancelled',?)").run(created);
  db.sqlite.prepare("INSERT INTO quotes(id,order_id,method,amount,mode,expires_at,created_at) VALUES('quote',1,'interac','25.00','test',?,?)").run(created,created);
  db.sqlite.prepare("INSERT INTO claims(id,order_id,quote_id,request_key,request_hash,method,confirmation,status,review_notes,reviewed_by,reviewed_at,created_at) VALUES('claim',1,'quote','test','test','interac','TEST','rejected','No funds received','test-admin',?,?)").run(created,created);
  const before={order:db.sqlite.prepare('SELECT * FROM orders').get(),claim:db.sqlite.prepare('SELECT * FROM claims').get(),audit:db.sqlite.prepare('SELECT * FROM audit').all()};
  db.sqlite.exec(await fs.readFile(new URL('../migrations/0004_authoritative_payment_state.sql',import.meta.url),'utf8'));
  assert.deepEqual(db.sqlite.prepare('SELECT * FROM orders').get(),before.order);assert.deepEqual(db.sqlite.prepare('SELECT * FROM claims').get(),before.claim);assert.deepEqual(db.sqlite.prepare('SELECT * FROM audit').all(),before.audit);
  const view=db.sqlite.prepare('SELECT order_status,payment_status,stored_payment_status FROM order_payment_records').get();assert.equal(view.order_status,'cancelled');assert.equal(view.payment_status,'rejected');assert.equal(view.stored_payment_status,'awaiting_verification');assert.equal(db.sqlite.prepare('PRAGMA foreign_key_check').all().length,0);
 }finally{db.close();}
});
