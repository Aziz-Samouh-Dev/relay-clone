import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {passwordHash,random} from '../server/security.mjs';

// No secret values or plaintext passwords are printed or passed as process arguments.
async function hidden(prompt){
 if(!process.stdin.isTTY)throw Error('Run in an interactive terminal; redirected password input is disabled.');
 process.stdout.write(prompt);process.stdin.setRawMode(true);process.stdin.resume();
 return new Promise((resolve,reject)=>{let value='';const finish=()=>{process.stdin.off('data',read);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');};
 const read=chunk=>{for(const c of chunk.toString('utf8')){if(c==='\u0003'){finish();reject(Error('Cancelled'));return;}if(c==='\r'||c==='\n'){finish();resolve(value);return;}if(c==='\u007f'||c==='\b'){value=Array.from(value).slice(0,-1).join('');continue;}if(c>=' ')value+=c;}};
 process.stdin.on('data',read);
 });
}

async function main(){
 const file=new URL('../.local/production-secrets.json',import.meta.url);
 if(process.argv[2]==='--verify'){
  const base=new URL(process.argv[3]||'https://relay-clone.aziz-samouh-11.workers.dev');
  if(base.origin!=='https://relay-clone.aziz-samouh-11.workers.dev')throw Error('Only the existing production Worker is allowed.');
  const secrets=JSON.parse(await fs.readFile(file,'utf8'));
  let password=await hidden('Admin password (hidden, one attempt only): ');
  const headers={Origin:base.origin,'Content-Type':'application/json','X-Lumina-Request':'1'};
  const response=await fetch(new URL('/api/admin/login',base),{method:'POST',headers,body:JSON.stringify({email:secrets.ADMIN_EMAIL,password}),signal:AbortSignal.timeout(15000)});password='';
  if(!response.ok){console.log('Login HTTP '+response.status+'. No retry performed.');process.exitCode=1;return;}
  const cookie=response.headers.get('set-cookie')?.split(';')[0],session=await response.json();
  if(!cookie||!session.csrf)throw Error('Login response did not establish a session.');
  try{const check=await fetch(new URL('/api/admin/session',base),{headers:{Cookie:cookie},signal:AbortSignal.timeout(15000)});if(check.status!==200)throw Error('Authenticated session check failed.');console.log('PASS: login and authenticated session returned HTTP 200.');}
  finally{const logout=await fetch(new URL('/api/admin/logout',base),{method:'POST',headers:{...headers,Cookie:cookie,'X-CSRF-Token':session.csrf},body:'{}',signal:AbortSignal.timeout(15000)});console.log(logout.ok?'Test session signed out.':'Sign-out failed; session will expire automatically.');}
  return;
 }
 try{await fs.access(file);throw Error('Private setup file already exists. Reuse it; do not rotate signing/encryption keys accidentally.');}catch(e){if(e.code!=='ENOENT')throw e;}
 const email=(await hidden('Admin email (hidden, enter exactly as used for login): ')).trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Invalid email.');
 let password=await hidden('New admin password (hidden, 16 to 300 characters): '),confirmation=await hidden('Confirm password (hidden): ');
 if(password.length<16||password.length>300||password!==confirmation)throw Error('Password length or confirmation is invalid.');
 const hash=await passwordHash(password);password='';confirmation='';
 const values={ADMIN_EMAIL:email,ADMIN_PASSWORD_HASH:hash,ORDER_SECRET:random(),SETTINGS_KEY:random()};
 await fs.mkdir(new URL('../.local/',import.meta.url),{recursive:true});
 await fs.writeFile(file,JSON.stringify(values,null,2)+'\n',{flag:'wx',mode:0o600});
 console.log('Prepared four secrets in the Git-ignored .local/production-secrets.json. No production configuration changed.');
}
main().catch(()=>{console.error('Setup/check failed. No secret values were printed. Check inputs, file existence and connectivity.');process.exitCode=1;});
