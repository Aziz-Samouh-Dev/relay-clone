import test from 'node:test';
import assert from 'node:assert/strict';
import {liveRate,rateFor,clearRateCache} from '../server/exchange-rates.mjs';

test('automatic live rates cache, expire, reject provider errors and stay separate from simulation',async()=>{
 clearRateCache();const clock=Date.now;let time=clock(),calls=0,unavailable=false;Date.now=()=>time;
 const env={RATE_FETCH:async url=>{calls++;if(unavailable)return new Response('{}',{status:503});const token=new URL(url).searchParams.get('currency');return new Response(JSON.stringify({data:{currency:token,rates:{CAD:'1.425'}}}));}};
 try{
  const [one,two]=await Promise.all([liveRate('USDT',env),liveRate('USDT',env)]);assert.equal(calls,1);assert.equal(one.cadPerToken,1.425);assert.deepEqual(one,two);assert.equal(one.environment,'live');assert.equal(Date.parse(one.expiresAt)-time,300000);assert.match(one.source,/Coinbase/);assert.ok(Number.isFinite(Date.parse(one.quotedAt)));
  await liveRate('USDT',env);assert.equal(calls,1);time+=300001;await liveRate('USDT',env);assert.equal(calls,2);time+=300001;unavailable=true;await assert.rejects(()=>liveRate('USDT',env),e=>e.status===503);
  const simulated=await rateFor(env,{mode:'test'},'USDT');assert.equal(simulated.environment,'test');assert.equal(simulated.cadPerToken,1.4);assert.equal(calls,3);
  clearRateCache();await assert.rejects(()=>liveRate('USDC',{RATE_FETCH:async()=>new Response(JSON.stringify({data:{currency:'USDC',rates:{CAD:'not-a-number'}}}))}),e=>e.status===503);
 }finally{Date.now=clock;clearRateCache();}
});
