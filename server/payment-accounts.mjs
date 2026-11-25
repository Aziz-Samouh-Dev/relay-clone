import {decrypt,encrypt,fail,hash,now,random,string} from './security.mjs';

export async function validWallet(value,network){
 if(!['ethereum','polygon','tron'].includes(network))return false;
 if(network!=='tron')return /^0x[0-9a-fA-F]{40}$/.test(value);
 if(!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(value))return false;
 const alphabet='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';let number=0n;
 for(const c of value)number=number*58n+BigInt(alphabet.indexOf(c));
 const bytes=[];while(number){bytes.unshift(Number(number&255n));number>>=8n;}
 if(bytes.length!==25||bytes[0]!==65)return false;
 const first=await crypto.subtle.digest('SHA-256',new Uint8Array(bytes.slice(0,21))),second=new Uint8Array(await crypto.subtle.digest('SHA-256',first));
 return bytes.slice(21).every((b,i)=>b===second[i]);
}
const select='SELECT * FROM payment_accounts';
const snapshot="json_object('id',id,'method',method,'network',network,'nickname',nickname,'enabled',enabled,'verified',verified,'legalApproved',legal_approved,'operationsApproved',operations_approved,'tokenVerified',token_verified,'isDefault',is_default,'priority',priority,'archived',archived,'version',version,'encrypted',encrypted)";
async function expand(env,row){const {encrypted,creation_key,creation_hash,...publicRow}=row;return {...publicRow,details:await decrypt(encrypted,env.SETTINGS_KEY)};}
export async function accountList(env,url){const limit=Number(url.searchParams.get('limit')||25),offset=Number(url.searchParams.get('offset')||0);if(![25,50,100].includes(limit)||!Number.isSafeInteger(offset)||offset<0)fail(400,'Invalid pagination');const archived=url.searchParams.get('archived')==='1'?1:0;const total=await env.DB.prepare('SELECT COUNT(*) total FROM payment_accounts WHERE archived=?').bind(archived).first(),rows=await env.DB.prepare(select+' WHERE archived=? ORDER BY priority DESC,nickname,id LIMIT ? OFFSET ?').bind(archived,limit,offset).all();return {rows:await Promise.all(rows.results.map(r=>expand(env,r))),total:total.total,limit,offset};}
export async function accountHistory(env,id){const rows=await env.DB.prepare('SELECT * FROM payment_account_history WHERE account_id=? ORDER BY version DESC').bind(id).all();return Promise.all(rows.results.map(async r=>{const data=JSON.parse(r.snapshot),encrypted=data.encrypted;delete data.encrypted;return {...r,snapshot:{...data,details:await decrypt(encrypted,env.SETTINGS_KEY)}};}));}
export async function saveAccount(env,id,p,actor,key){
 const allowed=['method','network','nickname','enabled','verified','legalApproved','operationsApproved','tokenVerified','isDefault','priority','archived','recipientName','email','address','tokenContract','notes','version'];
 if(Object.keys(p).some(k=>!allowed.includes(k)))fail(400,'Unsupported account field. Private keys and seed phrases are never accepted.');
 const old=id?await env.DB.prepare(select+' WHERE id=?').bind(id).first():null;if(id&&!old)fail(404,'Payment account not found');
 if(old&&(!Number.isInteger(p.version)||p.version!==old.version))fail(409,'Account changed. Reload its latest version.');
 const method=string(p.method,1,10),network=method==='interac'?'':string(p.network,1,20);if(!['interac','USDT','USDC'].includes(method)||method!=='interac'&&(!['ethereum','polygon','tron'].includes(network)||method==='USDC'&&network==='tron'))fail(400,'Unsupported currency or network');
 if(old&&(method!==old.method||network!==old.network))fail(409,'Create a new account to change its currency or network.');
 const nickname=string(p.nickname,2,120),priority=Number(p.priority||0);if(!Number.isSafeInteger(priority))fail(400,'Invalid display priority');
 const archived=p.archived===true,enabled=!archived&&p.enabled===true,isDefault=!archived&&p.isDefault===true,verified=p.verified===true,legal=p.legalApproved===true,operations=p.operationsApproved===true,tokenVerified=p.tokenVerified===true;
 const details={notes:string(p.notes||'',0,2000)};
 if(method==='interac'){details.recipientName=string(p.recipientName,2,200);details.email=string(p.email,5,254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email))fail(400,'Invalid recipient email');}
 else{details.address=string(p.address,20,100);details.tokenContract=string(p.tokenContract,20,100);if(!await validWallet(details.address,network)||!await validWallet(details.tokenContract,network))fail(400,'Invalid wallet address or token contract for this network');}
 // Changing a destination invalidates its separate verification attestations.
 if(old){const before=await decrypt(old.encrypted,env.SETTINGS_KEY);if(['recipientName','email','address','tokenContract'].some(k=>before[k]!==details[k])&&(verified||legal||operations||tokenVerified))fail(409,'Changed receiving details must first be saved with verification approvals cleared, then independently reverified.');}
 const data={method,network,nickname,enabled,verified,legal,operations,tokenVerified,isDefault,priority,archived,details},digest=await hash(JSON.stringify(data));
 if(!id){key=string(key,32,128);const existing=await env.DB.prepare(select+' WHERE creation_key=?').bind(key).first();if(existing){if(existing.creation_hash!==digest)fail(409,'Idempotency key conflict');return expand(env,existing);}}
 const accountId=id||random(),timestamp=now(),encrypted=await encrypt(details,env.SETTINGS_KEY),batch=[];
 const guard=id?'EXISTS(SELECT 1 FROM payment_accounts WHERE id=? AND version=?)':'1=1',guardArgs=id?[id,p.version]:[];
 if(isDefault){
  batch.push(env.DB.prepare(`INSERT INTO payment_account_history(account_id,version,action,actor,snapshot,created_at) SELECT id,version+1,'default_removed',?,json_set(${snapshot},'$.isDefault',0,'$.version',version+1),? FROM payment_accounts WHERE method=? AND network=? AND is_default=1 AND archived=0 AND id!=? AND ${guard}`).bind(actor,timestamp,method,network,accountId,...guardArgs));
  batch.push(env.DB.prepare(`UPDATE payment_accounts SET is_default=0,version=version+1,updated_by=?,updated_at=? WHERE method=? AND network=? AND is_default=1 AND archived=0 AND id!=? AND ${guard}`).bind(actor,timestamp,method,network,accountId,...guardArgs));
 }
 if(id)batch.push(env.DB.prepare('UPDATE payment_accounts SET nickname=?,enabled=?,verified=?,legal_approved=?,operations_approved=?,token_verified=?,is_default=?,priority=?,archived=?,encrypted=?,version=version+1,updated_by=?,updated_at=? WHERE id=? AND version=?').bind(nickname,+enabled,+verified,+legal,+operations,+tokenVerified,+isDefault,priority,+archived,encrypted,actor,timestamp,id,p.version));
 else batch.push(env.DB.prepare('INSERT INTO payment_accounts(id,method,network,nickname,enabled,verified,legal_approved,operations_approved,token_verified,is_default,priority,archived,encrypted,creation_key,creation_hash,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(accountId,method,network,nickname,+enabled,+verified,+legal,+operations,+tokenVerified,+isDefault,priority,+archived,encrypted,key,digest,actor,timestamp,timestamp));
 const action=!old?'created':archived?'archived':old.enabled!==+enabled?(enabled?'enabled':'disabled'):'edited';
 batch.push(env.DB.prepare(`INSERT INTO payment_account_history(account_id,version,action,actor,snapshot,created_at) SELECT id,version,?,?,${snapshot},? FROM payment_accounts WHERE id=? AND changes()=1`).bind(action,actor,timestamp,accountId));
 batch.push(env.DB.prepare("INSERT INTO audit(actor,action,details,created_at) SELECT ?,'payment_account_changed',?,? WHERE changes()=1").bind(actor,JSON.stringify({account:accountId,action}),timestamp));
 await env.DB.batch(batch);const saved=await env.DB.prepare(select+' WHERE id=?').bind(accountId).first();if(id&&(saved.version!==p.version+1||saved.encrypted!==encrypted))fail(409,'Account changed. Reload before retrying.');return expand(env,saved);
}
export async function eligibleAccounts(env,method,token,network){
 const type=method==='interac'?'interac':token;if(!['interac','USDT','USDC'].includes(type))return [];
 const args=[type],conditions=['method=?','enabled=1','archived=0','verified=1'];
 if(type!=='interac')conditions.push('legal_approved=1','operations_approved=1','token_verified=1');if(network&&type!=='interac'){conditions.push('network=?');args.push(network);}
 const rows=await env.DB.prepare(select+' WHERE '+conditions.join(' AND ')+' ORDER BY is_default DESC,priority DESC,nickname,id').bind(...args).all();
 return Promise.all(rows.results.map(async row=>{const d=await decrypt(row.encrypted,env.SETTINGS_KEY);return {id:row.id,version:row.version,nickname:row.nickname,type:row.method,network:row.network,isDefault:!!row.is_default,...(type==='interac'?{recipientName:d.recipientName,email:d.email}:{address:d.address,tokenContract:d.tokenContract})};}));
}
