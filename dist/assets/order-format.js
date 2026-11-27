// Shared by browser scripts and Worker code; no browser or Node dependencies.
globalThis.LuminaOrderFormat=(()=>{
 const durationFor=o=>{
  const trial=o.plan_id==='trial'||o.product_type==='trial'||(Number(o.months)===0&&/trial|essai/i.test(o.product||o.plan_name||''));
  return trial?{value:24,unit:'hours'}:{value:Number(o.months??o.duration?.value),unit:'months'};
 };
 const formatDuration=(o,locale='en-CA')=>{const d=durationFor(o),fr=locale.startsWith('fr');return d.value+' '+(d.unit==='hours'?(fr?'heures':d.value===1?'hour':'hours'):(fr?'mois':d.value===1?'month':'months'));};
 const formatScreens=(value,locale='en-CA')=>Number(value)+' '+(locale.startsWith('fr')?(Number(value)===1?'écran':'écrans'):(Number(value)===1?'screen':'screens'));
 const displayStatus=o=>['cancelled','refunded','fulfilled'].includes(o.order_status)?o.order_status:o.order_status==='processing'?'processing':o.payment_status||o.order_status;
 const expirationUTC=(o,activatedAt)=>{const start=new Date(activatedAt),d=durationFor(o);if(!Number.isFinite(start.getTime()))throw Error('Invalid activation timestamp');if(d.unit==='hours')return new Date(start.getTime()+d.value*3600000).toISOString();if(![1,3,6,12].includes(d.value))throw Error('Unsupported subscription duration');const end=new Date(start),day=end.getUTCDate();end.setUTCDate(1);end.setUTCMonth(end.getUTCMonth()+d.value);const last=new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth()+1,0)).getUTCDate();end.setUTCDate(Math.min(day,last));return end.toISOString();};
 const checkoutSelection=(catalog,values)=>{const plans=[...catalog.plans,catalog.trial],p=plans.find(p=>p.id===values.plan)||plans[0],trial=p.id==='trial',months=trial?0:([1,3,6,12].includes(Number(values.months))?Number(values.months):12),screens=trial?1:([1,2,3].includes(Number(values.screens))?Number(values.screens):1);return {plan_id:p.id,plan_name:p.name,months,screens,total_cents:Math.round((trial?p.price:p.prices[months][screens-1])*100)};};
 const paymentAccountSelection=(accounts,network,accountId)=>{const networks=[...new Set(accounts.map(a=>a.network).filter(Boolean))],chosen=networks.includes(network)?network:networks[0]||network,matching=accounts.filter(a=>!a.network||a.network===chosen);return {networks,network:chosen,accounts:matching,accountId:matching.some(a=>a.id===accountId)?accountId:(matching.find(a=>a.isDefault)||matching[0])?.id||''};};
 const paymentReviewChecks=(groups,method)=>({received:groups.funds===true,amount:groups.funds===true,recipient:groups.destination===true,...(method==='crypto'?{token:groups.destination===true,network:groups.destination===true,success:groups.settled===true,finality:groups.settled===true}:{})});
 return {paymentReviewChecks,paymentAccountSelection,checkoutSelection,durationFor,formatDuration,formatScreens,displayStatus,expirationUTC};
})();
