import test from 'node:test';
import assert from 'node:assert/strict';
import {validWallet} from '../server/payment-accounts.mjs';

test('network-specific public address validation rejects invalid Tron checksums',async()=>{
 const body=new Uint8Array([65,...Array(20).fill(7)]),first=await crypto.subtle.digest('SHA-256',body),checksum=new Uint8Array(await crypto.subtle.digest('SHA-256',first));
 let number=0n;for(const b of [...body,...checksum.slice(0,4)])number=number*256n+BigInt(b);const alphabet='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';let address='';while(number){address=alphabet[Number(number%58n)]+address;number/=58n;}
 assert.equal(await validWallet(address,'tron'),true);assert.equal(await validWallet(address.slice(0,-1)+(address.endsWith('1')?'2':'1'),'tron'),false);
 assert.equal(await validWallet('0x'+'f'.repeat(40),'ethereum'),true);assert.equal(await validWallet('0x'+'a'.repeat(40),'polygon'),true);assert.equal(await validWallet('0x'+'a'.repeat(64),'ethereum'),false);assert.equal(await validWallet(address,'ethereum'),false);assert.equal(await validWallet('0x'+'a'.repeat(40),'unsupported'),false);
});
