import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs/promises';
import path from 'node:path';
export class LocalD1 {
 constructor(file=':memory:'){this.sqlite=new DatabaseSync(file);this.sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');}
 prepare(sql){const db=this;return {values:[],bind(...values){this.values=values;return this;},async first(){return db.sqlite.prepare(sql).get(...this.values)||null;},async all(){return {results:db.sqlite.prepare(sql).all(...this.values)};},async run(){const r=db.sqlite.prepare(sql).run(...this.values);return {success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}};}};}
 async batch(statements){this.sqlite.exec('BEGIN IMMEDIATE');try{const results=[];for(const s of statements)results.push(await s.run());this.sqlite.exec('COMMIT');return results;}catch(e){this.sqlite.exec('ROLLBACK');throw e;}}
 async migrate(){this.sqlite.exec('CREATE TABLE IF NOT EXISTS _migrations(name TEXT PRIMARY KEY)');for(const name of (await fs.readdir(new URL('../migrations/',import.meta.url))).filter(n=>n.endsWith('.sql')).sort()){if(this.sqlite.prepare('SELECT name FROM _migrations WHERE name=?').get(name))continue;this.sqlite.exec('BEGIN');try{this.sqlite.exec(await fs.readFile(new URL('../migrations/'+name,import.meta.url),'utf8'));this.sqlite.prepare('INSERT INTO _migrations VALUES(?)').run(name);this.sqlite.exec('COMMIT');}catch(e){this.sqlite.exec('ROLLBACK');throw e;}}}
 close(){this.sqlite.close();}
}
export class LocalBucket {
 constructor(directory){this.directory=directory;}
 file(key){if(!/^(?:invoices\/(?:demo-)?\d+\.pdf|test-backups\/[a-f0-9]{64}\.json)$/.test(key))throw new Error('Invalid private file key');return path.join(this.directory,key);}
 async get(key){try{const bytes=await fs.readFile(this.file(key));return {arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};}catch(e){if(e.code==='ENOENT')return null;throw e;}}
 async delete(key){await fs.rm(this.file(key),{force:true});}
 async put(key,data){const file=this.file(key);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,data);}
}
