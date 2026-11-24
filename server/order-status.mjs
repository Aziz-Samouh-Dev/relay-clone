import {fail,now,string} from './security.mjs';

export async function updateOrderStatus(env,o,p,actor){
 if(!['cancelled','processing'].includes(p.status))fail(400,'Choose Cancelled or Processing');
 if(o.order_status===p.status)return {ok:true,status:o.order_status,unchanged:true};
 if(['cancelled','refunded'].includes(o.order_status))fail(409,'Closed orders cannot be reopened. Use financial reconciliation for received funds.');
 if(o.order_status==='fulfilled')fail(409,'Fulfilled orders cannot be cancelled here. Resolve the subscription and any refund separately.');
 const subscription=await env.DB.prepare('SELECT id FROM subscriptions WHERE order_id=? LIMIT 1').bind(o.id).first();
 if(subscription)fail(409,'This order has subscription history. Resolve fulfillment and any refund separately.');
 if(o.payment_status==='refunded')fail(409,'Refunded orders cannot change fulfillment status here.');
 const testCancellation=p.status==='cancelled'&&o.payment_status==='paid';
 if(testCancellation&&o.mode!=='test')fail(409,'Real paid orders require financial reconciliation or a verified refund before closure.');
 if(testCancellation&&p.testCancellation!==true)fail(409,'Paid test orders require explicit test cancellation confirmation. No refund or payment change will be recorded.');
 if(p.status==='processing'&&o.payment_status!=='paid')fail(409,'Only verified paid orders can move to Processing.');
 if(p.status==='cancelled'&&(typeof p.reason!=='string'||p.reason.trim().length<3))fail(400,'Enter a cancellation reason of at least 3 characters.');
 const reason=p.status==='cancelled'?string(p.reason,3,1000):'';
 const timestamp=now(),action=testCancellation?'test_order_cancelled':'order_status';
 // Optimistic state checks and the subscription guard are repeated in the write.
 await env.DB.batch([
  env.DB.prepare('UPDATE orders SET order_status=? WHERE id=? AND order_status=? AND payment_status=? AND mode=? AND NOT EXISTS(SELECT 1 FROM subscriptions WHERE order_id=?)').bind(p.status,o.id,o.order_status,o.stored_payment_status??o.payment_status,o.mode,o.id),
  env.DB.prepare('INSERT INTO audit(actor,action,order_id,details,created_at) SELECT ?,?,?,?,? WHERE changes()=1').bind(actor,action,o.id,JSON.stringify({from:o.order_status,status:p.status,reason,testCancellation}),timestamp)
 ]);
 const saved=await env.DB.prepare('SELECT order_status FROM orders WHERE id=?').bind(o.id).first();
 if(saved.order_status!==p.status)fail(409,'Order changed during review. Refresh and check payment and fulfillment before retrying.');
 return {ok:true,status:saved.order_status};
}
