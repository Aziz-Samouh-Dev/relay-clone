import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('status UI restores persisted status, keeps failed selection and shows inline API reason',async()=>{
 let order={reference:'TEST',customer:{name:'Test',email:'test@example.invalid'},plan_name:'24-hour trial',plan_id:'trial',months:0,screens:1,total_cents:2500,payment_status:'pending_payment',order_status:'pending_payment',mode:'test',claims:[],invoices:[],subscriptions:[],notes:'',verificationHistory:[],quotes:[]};
 let failUpdate=true,detailReads=0,renderCount=0,posted,rendered='';
 const forms=new Map(),messages={textContent:''};
 const makeForm=()=>({elements:{status:{value:''},testCancellation:{checked:false}},fields:{reason:'Test cancellation'},dataset:{},handlers:{},addEventListener(name,fn){this.handlers[name]=fn;},querySelector(){return this.error;},error:{textContent:'',setAttribute(){},scrollIntoView(){}}});
 const content={set innerHTML(v){rendered=v;renderCount++;forms.clear();for(const key of ['[data-order-state]','[data-notes]','[data-activate]','[data-credit]'])forms.set(key,makeForm());},querySelectorAll(){return [];}};
 const login=makeForm(),shell={querySelector(s){if(s==='[data-admin-status]')return messages;if(s==='[data-admin-content]')return content;if(s==='[data-admin-login-form]')return login;return forms.get(s)||null;}};
 const context={document:{documentElement:{lang:'en-CA'},querySelector:()=>shell,addEventListener(){}},window:{LuminaDeliveryAdmin:async()=>{}},location:{pathname:'/admin/orders/'},crypto:globalThis.crypto,Intl,URL,FormData:class{constructor(form){this.form=form;}*[Symbol.iterator](){yield ['status',this.form.elements.status.value];yield ['reason',this.form.fields.reason];}},fetch:async(url,options)=>{
  if(url.endsWith('/session'))return {ok:false,json:async()=>({error:'Sign in required'})};
  if(options.method==='POST'){posted=JSON.parse(options.body);if(failUpdate)return {ok:false,json:async()=>({error:'Real paid orders require financial reconciliation or a verified refund before closure.'})};order={...order,order_status:posted.status};return {ok:true,json:async()=>({ok:true,status:posted.status})};}
  detailReads++;return {ok:true,json:async()=>order};
 }};
 let source=await fs.readFile(new URL('../source/admin.js',import.meta.url),'utf8');
 // Expose the existing renderer only inside this isolated test VM.
 source=source.replace(/\}\)\(\);\s*$/,'globalThis.renderOrderForTest=detail;})();');
 vm.runInNewContext(await fs.readFile(new URL('../source/order-format.js',import.meta.url),'utf8'),context);vm.runInNewContext(source,context);await context.renderOrderForTest('a'.repeat(64));
 assert.ok(rendered.includes('24 hours'));assert.ok(rendered.includes('1 screen'));assert.ok(!rendered.includes('24 months'));
 let form=forms.get('[data-order-state]');assert.equal(form.elements.status.value,'pending_payment');form.elements.status.value='cancelled';const before=renderCount;
 const submit=()=>({target:form,submitter:{tagName:'BUTTON',disabled:false},preventDefault(){}});
 await form.handlers.submit(submit());assert.match(form.error.textContent,/financial reconciliation/);assert.match(messages.textContent,/financial reconciliation/);assert.equal(form.elements.status.value,'cancelled');assert.equal(renderCount,before);assert.equal(detailReads,1);assert.equal(posted.reason,'Test cancellation');assert.equal(posted.testCancellation,false);
 failUpdate=false;await form.handlers.submit(submit());assert.equal(renderCount,before+1);assert.equal(forms.get('[data-order-state]').elements.status.value,'cancelled');assert.match(messages.textContent,/Status saved/);assert.match(rendered,/data-order-main-status><span class="admin-badge state-cancelled">/);
 await context.renderOrderForTest('a'.repeat(64));assert.equal(forms.get('[data-order-state]').elements.status.value,'cancelled');
 order={...order,payment_status:'paid',order_status:'processing'};await context.renderOrderForTest('a'.repeat(64));assert.ok(!rendered.includes('<form data-order-state>'));assert.ok(!rendered.includes('Cancellation reason'));assert.ok(rendered.includes('<form data-activate>'));
});
