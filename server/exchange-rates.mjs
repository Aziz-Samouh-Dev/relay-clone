import {fail} from './security.mjs';
const memory=new Map(),inflight=new Map();
export async function liveRate(token,env={}){
 if(!['USDT','USDC'].includes(token))fail(400,'Unsupported rate token');
 const key='https://lumina-rate-cache.invalid/live/'+token,cached=memory.get(token);
 if(cached&&Date.parse(cached.expiresAt)>Date.now())return cached;
 if(inflight.has(token))return inflight.get(token);
 const operation=(async()=>{
  const cache=globalThis.caches?.default;
  if(cache){const response=await cache.match(key);if(response){const data=await response.json();if(Date.parse(data.expiresAt)>Date.now()){memory.set(token,data);return data;}}}
  const response=await (env.RATE_FETCH||fetch)('https://api.coinbase.com/v2/exchange-rates?currency='+token,{signal:AbortSignal.timeout(7000),headers:{Accept:'application/json'}});
  if(!response.ok)fail(503,'Automatic exchange rates are temporarily unavailable');
  const data=await response.json(),cadPerToken=Number(data.data?.rates?.CAD);if(data.data?.currency!==token||!Number.isFinite(cadPerToken)||cadPerToken<.1||cadPerToken>10)fail(503,'Exchange provider returned an invalid CAD rate');
  const quotedAt=new Date().toISOString(),rate={token,cadPerToken,quotedAt,expiresAt:new Date(Date.now()+300000).toISOString(),source:'Coinbase public exchange rates',environment:'live',timestampType:'fetched_at'};
  memory.set(token,rate);if(cache)await cache.put(key,new Response(JSON.stringify(rate),{headers:{'Content-Type':'application/json','Cache-Control':'public,max-age=300'}}));return rate;
 })();inflight.set(token,operation);try{return await operation;}catch(error){if(error.status)throw error;fail(503,'Automatic exchange rates are temporarily unavailable');}finally{inflight.delete(token);}
}
export function clearRateCache(){memory.clear();inflight.clear();}
export async function rateFor(env,s,token){
 if(s.mode==='test')return {cadPerToken:1.4,quotedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+300000).toISOString(),source:'Local simulation',environment:'test'};
 // Isolated legacy regression fixtures never contact a provider implicitly.
 if(env.LOCAL_DEV==='true'&&!env.AUTO_RATES)return s.crypto.rates[token]||null;
 return liveRate(token,env);
}
