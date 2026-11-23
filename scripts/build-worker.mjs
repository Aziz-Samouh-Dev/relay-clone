import {build} from 'esbuild';
await build({entryPoints:['server/worker.mjs'],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:'.worker-build/index.js',minify:false});
console.log('Worker bundled in .worker-build/index.js. No deployment performed.');
