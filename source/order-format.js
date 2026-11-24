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
 return {durationFor,formatDuration,formatScreens,displayStatus,expirationUTC};
})();
