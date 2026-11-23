import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {LocalD1} from '../server/local.mjs';
import {settings,saveSettings} from '../server/settings.mjs';
const input=await new Promise(resolve=>{let value='';if(process.stdin.isTTY)process.stdin.setRawMode(true);process.stdin.resume();console.log('Ready for private email configuration (input hidden).');process.stdin.on('data',chunk=>{for(const c of chunk.toString()){if(c==='\r'||c==='\n'){if(process.stdin.isTTY)process.stdin.setRawMode(false);process.stdin.pause();resolve(value);return;}value+=c;}});});
const {key}=JSON.parse(input);if(typeof key!=='string'||!/^re_[A-Za-z0-9_-]+$/.test(key))throw Error('Invalid email API key format');
const file=new URL('../.env.local',import.meta.url);let envText=await fs.readFile(file,'utf8');envText=/^EMAIL_API_KEY=.*$/m.test(envText)?envText.replace(/^EMAIL_API_KEY=.*$/m,'EMAIL_API_KEY='+key):envText.trimEnd()+'\nEMAIL_API_KEY='+key+'\n';await fs.writeFile(file,envText,{mode:0o600});process.loadEnvFile(fileURLToPath(file));
const DB=new LocalD1(fileURLToPath(new URL('../.local/lumina.sqlite',import.meta.url)));try{const env={DB,SETTINGS_KEY:process.env.SETTINGS_KEY},s=await settings(env);s.email={enabled:true,from:'Lumina Stream <onboarding@resend.dev>'};await saveSettings(env,s,'local-owner-configuration');}finally{DB.close();}
const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':'lumina-owner-hello-test-20261123'},body:JSON.stringify({from:'onboarding@resend.dev',to:['aziz.samouh.11@gmail.com'],subject:'Hello World',html:'<p>Congrats on sending your <strong>first email</strong>!</p>'})});
const result=await response.json();console.log(JSON.stringify({configured:true,testAccepted:response.ok,status:response.status,emailId:result.id||null,error:response.ok?undefined:result.message}));
