import fs from 'node:fs/promises';
const file=new URL('../source/build.mjs',import.meta.url);
let s=await fs.readFile(file,'utf8');
s=s.replace(/const mark=\(\)=>`[^\n]+`;/,`const mark=()=>\`<span class="brand-mark lumina-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><rect x="3" y="5" width="26" height="19" rx="5"/><path class="logo-play" d="m13 10 8 4.5-8 4.5z"/><path d="M11 28h10"/></svg></span><span class="brand-name">Lumina <span>Stream</span></span>\`;`);
s=s.replace('<div class="footer-large" aria-hidden="true">relay television</div>','<div class="footer-large" aria-hidden="true">Lumina Stream</div>');
s=s.replace(/<div class="hero-card"[\s\S]*?<\/small><\/div>/,'');
const images={'alpine.jpg':'watching-tv.jpg','forest.jpg':'cinema-tv.jpg','night-sky.jpg':'cinema-tv.jpg','journey.jpg':'sports-tv.jpg'};
for(const [old,fresh] of Object.entries(images))s=s.replaceAll(old,fresh);
const alts={
 'Dramatic alpine peaks under a softly lit evening sky':'A couple relaxing on a sofa and watching a cinematic film on television',
 'Alpine landscape — Relay TV':'Lumina Stream television and movie night at home',
 'Sunlight falling through a deep green forest':'A large television showing cinematic film scenes and live sports',
 'Mountain peaks and wide open skies':'People watching a film on television at home',
 'A cinematic city street illuminated with coloured lights':'A television displaying original cinema and sports artwork',
 'A quiet sunlit landscape':'A football match shown on a television in a living room',
 'An atmospheric city street at night':'A television displaying cinematic entertainment',
 'A wide open landscape in golden light':'A television showing a live football match in a comfortable living room',
 'Alpine peaks under evening light':'A couple watching television together at home',
 'Alpine peaks in soft light':'People watching television together at home',
 'Sunlight through a quiet forest':'A television showing film and sports entertainment',
 'A city street illuminated at night':'A television displaying cinematic artwork',
 'An open landscape at sunset':'A football match displayed on a large television',
 'Quiet woodland in soft sunlight':'A cinematic television display',
 'Alpine mountain peaks':'A couple enjoying a television evening',
 'An atmospheric landscape':'A television and remote in a contemporary living room',
};
for(const [old,fresh] of Object.entries(alts))s=s.replaceAll(old,fresh);
s=s.replace('href="/channels/?category=Discovery"','href="/channels/?category=News"');
s=s.replace('Discovery & documentary</span><h3>Beyond<br>the familiar.</h3><p>For a little more perspective.','Live TV & channels</span><h3>Your world.<br>Live on screen.</h3><p>News, culture and everyday favourites.');
s=s.replace('Entertainment</span><h3>One more<br>good evening.</h3><p>Find what you look forward to.','Movies & series</span><h3>Just one<br>more episode.</h3><p>Make it a proper movie night.');
s=s.replace('href="/channels/?category=International"','href="/channels/?category=Sports"');
s=s.replace('Languages & culture</span><h3>A little<br>closer to home.</h3><p>Make room for your world.','Sports & live events</span><h3>Every moment.<br>On the big screen.</h3><p>For the matches you make time for.');
s=s.replace('width="2000" height="1333"','width="1672" height="941"');
s=s.replace('<g stroke="#11190e" stroke-width="5" stroke-linecap="round"><path d="M32 12v40M12 32h40M18 18l28 28M18 46l28-28"/></g>','<g stroke="#11190e" stroke-width="3.5" fill="none" stroke-linecap="round"><rect x="10" y="13" width="44" height="32" rx="8"/><path d="M24 53h16"/></g><path d="m27 21 14 8-14 8z" fill="#11190e"/>');
await fs.writeFile(file,s);
const articleFile=new URL('../source/articles.mjs',import.meta.url);let articles=await fs.readFile(articleFile,'utf8');for(const [old,fresh]of Object.entries(images))articles=articles.replaceAll(old,fresh);await fs.writeFile(articleFile,articles);
console.log('Updated one-line wordmark, TV/play icon, footer, hero and IPTV images.');
