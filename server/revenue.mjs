import {fail} from './security.mjs';

// Identical financial aggregation for real and demo data; only mode differs.
export async function verifiedRevenue(db,mode){
 if(!['live','test'].includes(mode))fail(400,'Invalid revenue mode');
 const from=" FROM order_payment_records o JOIN claims c ON c.order_id=o.id AND c.status='verified' JOIN quotes q ON q.id=c.quote_id AND q.mode=o.mode WHERE o.mode=? AND o.payment_status='paid'";
 const total=await db.prepare('SELECT COUNT(*) orders,COALESCE(SUM(o.total_cents),0) cents'+from).bind(mode).first();
 const months=(await db.prepare("SELECT substr(c.reviewed_at,1,7) month,SUM(o.total_cents) cents"+from+' GROUP BY month ORDER BY month DESC LIMIT 24').bind(mode).all()).results;
 return {mode,is_simulated:mode==='test',label:mode==='test'?'Demo Live Revenue':'Verified Live Revenue',...total,months};
}
