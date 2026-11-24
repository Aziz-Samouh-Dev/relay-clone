import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('orders table renders separate fulfillment/payment columns and refreshes authoritative states',async()=>{
 const source=await fs.readFile(new URL('../source/admin-data.js',import.meta.url),'utf8');
 for(const lang of ['en-CA','fr-CA']){
  const nodes=new Map(),node=()=>({value:'',dataset:{},textContent:'',innerHTML:'',handlers:{},append(){},insertBefore(){},setAttribute(){},addEventListener(name,fn){this.handlers[name]=fn;}});
  const root={innerHTML:'',querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);},querySelectorAll(){return [];}};
  const context={window:{},location:{search:''},document:{documentElement:{lang},createElement:node},URLSearchParams,setTimeout,clearTimeout};vm.runInNewContext(await fs.readFile(new URL('../source/order-format.js',import.meta.url),'utf8'),context);vm.runInNewContext(source,context);
  const fr=lang==='fr-CA',L=(en,frText)=>fr?frText:en;let row={id:2,reference:'TEST',public_id:'test',customer_name:'Test',customer_email:'test@example.invalid',plan_name:'24-hour trial',plan_id:'trial',months:0,screens:1,order_status:'cancelled',payment_status:'rejected',total_cents:2500,created_at:'2026-11-24T12:00:00Z'};
  row.payment_status='awaiting_verification';
  const draw=await context.window.LuminaAdminData({revenue:{is_simulated:false,cents:35000,orders:3},root,kind:'orders',api:async()=>({rows:[row],total:1}),L,e:String,money:String,stateLabel:s=>s,orderLink:r=>r.reference,onRows(){}});
  assert.ok(root.innerHTML.includes(fr?'Revenus vérifiés':'Verified revenue'));assert.ok(root.innerHTML.includes('35000'));
  let html=nodes.get('[data-results]').innerHTML;assert.ok(html.includes(L('Order Status','État de la commande')));assert.ok(html.includes(L('Payment Status','État du paiement')));assert.match(html,/state-cancelled/);assert.match(html,/<td><span class="admin-badge state-cancelled">/);assert.match(html,/state-awaiting_verification/);assert.ok(html.includes(fr?'24 heures':'24 hours'));assert.ok(html.includes(fr?'1 écran':'1 screen'));
  row={...row,payment_status:'paid'};await draw();html=nodes.get('[data-results]').innerHTML;assert.match(html,/state-paid/);assert.match(html,/state-cancelled/);assert.doesNotMatch(html,/state-rejected/);
 }
});
