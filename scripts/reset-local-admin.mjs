import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {passwordHash,random} from '../server/security.mjs';
import {LocalD1} from '../server/local.mjs';
const file=new URL('../.env.local',import.meta.url);
let content=await fs.readFile(file,'utf8');
const password=random().slice(0,24),email='admin@localhost.invalid';
for(const [key,value]of Object.entries({ADMIN_EMAIL:email,ADMIN_PASSWORD_HASH:await passwordHash(password),LOCAL_ADMIN_PASSWORD:password})){
 const line=new RegExp('^'+key+'=.*$','m');content=line.test(content)?content.replace(line,key+'='+value):content+'\n'+key+'='+value;
}
await fs.writeFile(file,content,{mode:0o600});
const dbPath=new URL('../.local/lumina.sqlite',import.meta.url);
try{await fs.access(dbPath);const db=new LocalD1(fileURLToPath(dbPath));try{await db.batch([db.prepare('DELETE FROM sessions'),db.prepare("DELETE FROM rate_limits WHERE key LIKE 'login:%'")]);}finally{db.close();}}catch(e){if(e.code!=='ENOENT')throw e;}
console.log(JSON.stringify({email,password,scope:'local only'}));
