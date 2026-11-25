import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('account manager submits separate enable/verification flags, versioned edits and explicit zero tax',async()=>{
 const element=()=>({value:'',checked:false,hidden:false,dataset:{},disabled:false,closest:()=>({hidden:false}),scrollIntoView(){}});
 const form=()=>({elements:new Proxy({},{get(target,key){return target[key]??(target[key]=element());}})});
 let accountForm=form(),billingForm=form(),account=null,posted,headers;
 const area={hidden:true,innerHTML:'',scrollIntoView(){},showModal(){},close(){},querySelector(s){if(s==='form')return accountForm;return element();}},buttons=new Map();
 const root={innerHTML:'',querySelector(s){if(s==='[data-account-editor]')return area;if(s==='[data-billing]')return billingForm;if(!buttons.has(s))buttons.set(s,element());return buttons.get(s);},querySelectorAll(s){return s==='[data-edit]'&&account?[{dataset:{edit:account.id},set onclick(fn){this.handler=fn;buttons.set('edit',this);}}]:[];}};
 const api=async(path,data,extra)=>{if(path.startsWith('readiness'))return {accounts:account?[{id:account.id,ready:false,reasons:['recipient_not_verified']}]:[]};if(path==='billing'){
  if(data){posted=data;return {};}
  return {brand:'Lumina Stream',seller:{name:'',address:'',email:'',taxNumber:''},tax:{configured:false,rateBps:0,label:'Tax'},billing:{requiredFields:[]},rates:{}};
 }if(data){posted=data;headers=extra;account={id:'a'.repeat(64),method:data.method,network:data.network,nickname:data.nickname,priority:data.priority,enabled:+data.enabled,verified:+data.verified,is_default:+data.isDefault,version:account?2:1,details:{recipientName:data.recipientName,email:data.email,notes:data.notes}};accountForm=form();billingForm=form();return account;}return {rows:account?[account]:[],total:account?1:0};};
 const context={URLSearchParams,window:{},crypto:globalThis.crypto};vm.runInNewContext(await fs.readFile(new URL('../source/admin-accounts.js',import.meta.url),'utf8'),context);
 await context.window.LuminaPaymentAccounts({root,api,L:en=>en,e:String,message(){}});
 buttons.get('[data-new]').onclick();accountForm.elements.method.value='interac';accountForm.elements.method.onchange();accountForm.elements.nickname.value='Office';accountForm.elements.recipientName.value='Recipient';accountForm.elements.email.value='recipient@merchant.ca';accountForm.elements.enabled.checked=true;accountForm.elements.verified.checked=false;
 await accountForm.onsubmit({preventDefault(){},submitter:element()});assert.equal(posted.method,'interac');assert.equal(posted.enabled,true);assert.equal(posted.verified,false);assert.equal(posted.email,'recipient@merchant.ca');assert.ok(headers['Idempotency-Key'].length>=32);
 buttons.get('edit').handler();accountForm.elements.nickname.value='Renamed Office';await accountForm.onsubmit({preventDefault(){},submitter:element()});assert.equal(posted.version,1);assert.equal(posted.nickname,'Renamed Office');assert.equal(posted.verified,false);
 vm.runInNewContext(await fs.readFile(new URL('../source/admin-settings.js',import.meta.url),'utf8'),context);await context.window.LuminaSettings({root,api,L:en=>en,e:String,message(){}});
 billingForm.elements.sellerName.value='Legal seller';billingForm.elements.sellerAddress.value='Legal address';billingForm.elements.sellerEmail.value='seller@merchant.ca';billingForm.elements.taxConfigured.checked=true;billingForm.elements.taxRate.value='0';billingForm.elements.taxLabel.value='Configured tax';
 await billingForm.onsubmit({preventDefault(){},submitter:element()});assert.equal(posted.tax.rateBps,0);assert.equal(posted.tax.configured,true);assert.equal(posted.billing.legalInformationVerified,false);assert.equal(posted.billing.finalInvoicesEnabled,false);assert.equal(posted.seller.taxNumber,'');assert.ok(!('exempt' in posted.tax));
});
