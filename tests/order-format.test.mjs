import test from 'node:test';
import assert from 'node:assert/strict';
import '../source/order-format.js';
import {PDFDocument,PDFRawStream,decodePDFRawStream} from 'pdf-lib';
import {invoiceSnapshot,pdfInvoice} from '../server/invoices.mjs';
import {defaults} from '../server/settings.mjs';
const F=globalThis.LuminaOrderFormat;

test('cancelled status wins over payment status without changing financial state',()=>{
 for(const payment_status of ['pending_payment','awaiting_verification','paid','rejected','refunded']){
  const o={order_status:'cancelled',payment_status},before=JSON.stringify(o);assert.equal(F.displayStatus(o),'cancelled');assert.equal(JSON.stringify(o),before);
 }
 assert.equal(F.displayStatus({order_status:'pending_payment',payment_status:'pending_payment'}),'pending_payment');
 assert.equal(F.displayStatus({order_status:'pending_payment',payment_status:'awaiting_verification'}),'awaiting_verification');
});

test('trial and calendar durations, screen plurals and exact UTC expiration',()=>{
 for(const months of [0,24])assert.deepEqual(F.durationFor({plan_id:'trial',months}),{value:24,unit:'hours'});
 assert.equal(F.formatDuration({plan_id:'trial',months:0}),'24 hours');assert.equal(F.formatDuration({plan_id:'trial',months:0},'fr-CA'),'24 heures');
 for(const months of [1,3,6,12]){assert.equal(F.formatDuration({plan_id:'duck',months}),months+' '+(months===1?'month':'months'));assert.equal(F.formatDuration({plan_id:'duck',months},'fr-CA'),months+' mois');}
 for(const screens of [1,2,3]){assert.equal(F.formatScreens(screens),screens+' '+(screens===1?'screen':'screens'));assert.equal(F.formatScreens(screens,'fr-CA'),screens+' '+(screens===1?'écran':'écrans'));}
 const activated='2026-11-01T01:30:00.123-04:00',end=F.expirationUTC({plan_id:'trial',months:0},activated);assert.equal(new Date(end)-new Date(activated),86400000);assert.equal(end,'2026-11-02T05:30:00.123Z');
 assert.equal(F.expirationUTC({plan_id:'duck',months:1},'2026-01-31T12:00:00Z'),'2026-02-28T12:00:00.000Z');
});

test('trial PDF text and snapshots use hours, including legacy snapshots; standard terms stay months',async()=>{
 for(const locale of ['en-CA','fr-CA'])for(const trial of [true,false]){
  const o={id:1,created_at:'2026-11-24T12:00:00Z',plan_id:trial?'trial':'duck',plan_name:trial?'24-hour trial':'Duck',months:trial?0:1,screens:1,subtotal_cents:2500,tax_cents:0,tax_label:'Test',total_cents:2500,locale};
  const snapshot=invoiceSnapshot(o,{name:'Test',email:'test@example.invalid'},defaults());assert.deepEqual(JSON.parse(snapshot).duration,{value:trial?24:1,unit:trial?'hours':'months'});
  for(const legacy of [false,true]){const data=JSON.parse(snapshot);if(legacy){delete data.duration;delete data.product_type;delete data.plan_id;}
   const bytes=await pdfInvoice({id:1,kind:'proforma',status:'issued',amount_cents:2500,created_at:o.created_at,snapshot:JSON.stringify(data)}),doc=await PDFDocument.load(bytes);let text='';
   for(const [,obj]of doc.context.enumerateIndirectObjects())if(obj instanceof PDFRawStream){let content;try{content=Buffer.from(decodePDFRawStream(obj).decode()).toString('latin1');}catch{continue;}text+=content.replace(/<([\da-f]+)>/gi,(_,hex)=>Buffer.from(hex,'hex').toString('latin1'));}
   assert.ok(text.includes(trial?(locale==='fr-CA'?'24 heures':'24 hours'):(locale==='fr-CA'?'1 mois':'1 month')));assert.ok(text.includes(locale==='fr-CA'?'1 écran':'1 screen'));assert.ok(!text.includes('24 months'));assert.ok(text.includes('DEMO / TEST - NO REAL PAYMENT RECEIVED'));assert.ok(text.includes(locale==='fr-CA'?'Ne constitue pas une facture fiscale.':'NOT A TAX INVOICE.'));
  }
 }
});

test('checkout selection normalizes trial and standard plans without stale summaries',async()=>{
 const fs=await import('node:fs/promises'),pricing=JSON.parse(await fs.readFile(new URL('../source/pricing.json',import.meta.url),'utf8')),catalog={plans:pricing.plans,trial:{id:'trial',name:'24-hour trial',price:pricing.trialPrice}};
 const raccoon=F.checkoutSelection(catalog,{plan:'raccoon',months:'12',screens:'3'});assert.equal(raccoon.plan_name,'Raccoon');assert.equal(raccoon.total_cents,31000);
 const trial=F.checkoutSelection(catalog,{plan:'trial',months:'12',screens:'3'});assert.equal(trial.plan_name,'24-hour trial');assert.equal(trial.months,0);assert.equal(trial.screens,1);assert.equal(trial.total_cents,299);assert.equal(F.formatDuration(trial),'24 hours');
 const back=F.checkoutSelection(catalog,{plan:'duck',months:'3',screens:'2'});assert.equal(back.plan_name,'Duck');assert.equal(back.months,3);assert.equal(back.screens,2);assert.equal(back.total_cents,5500);
});
