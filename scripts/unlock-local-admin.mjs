import {fileURLToPath} from 'node:url';
import {LocalD1} from '../server/local.mjs';
const db=new LocalD1(fileURLToPath(new URL('../.local/lumina.sqlite',import.meta.url)));
try{const result=await db.prepare("DELETE FROM rate_limits WHERE key LIKE 'login:%'").run();console.log('Cleared local administrator login lockout. Rate-limit protection remains enabled.');}finally{db.close();}
