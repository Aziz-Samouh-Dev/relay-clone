export const photoTranslations={
 'A family watching television together on a sofa':'Une famille regarde la télévision ensemble sur un canapé',
 'Moviegoers enjoying a film in a dark cinema':'Des spectateurs regardent un film dans une salle de cinéma',
 'Ice hockey players skating during a live game':'Des joueurs de hockey sur glace pendant un match',
 'A family relaxing together for television time':'Une famille réunie pour regarder la télévision',
 'A couple enjoying a movie with popcorn at home':'Un couple regarde un film avec du maïs soufflé à la maison',
 'Ice hockey players gathered on an indoor rink':'Des joueurs de hockey sur une patinoire intérieure',
 'A modern home television and living room setup':'Un téléviseur dans un salon moderne',
 'A couple watching a film at the cinema':'Un couple regarde un film au cinéma',
 'A couple watching entertainment on a laptop':'Un couple regarde un programme sur un ordinateur portable',
 'A home entertainment setup with a large television':'Une installation de divertissement avec un grand téléviseur',
 'A mother and son watching television together':'Une mère et son fils regardent la télévision ensemble',
 'A family enjoying television time at home':'Une famille regarde la télévision à la maison',
 'Choose a hero image':'Choisir une image principale',
 'TV at home':'Télé à la maison','Movie nights':'Soirées cinéma','Live hockey':'Hockey en direct',
};
export const photoFiles={
 'hero-real.jpg':'viewing-home.jpg','cinema-real.jpg':'viewing-movies.jpg','sports-real.jpg':'viewing-hockey.jpg',
 'journal-iptv.jpg':'article-iptv.jpg','journal-cinema.jpg':'article-plans.jpg','journal-device.jpg':'article-devices.jpg','journal-buffering.jpg':'article-connection.jpg','journal-4k.jpg':'article-picture.jpg','journal-canada.jpg':'article-canada.jpg',
};
const altByFile={
 'viewing-home.jpg':'A family relaxing together for television time','viewing-movies.jpg':'A couple enjoying a movie with popcorn at home','viewing-hockey.jpg':'Ice hockey players gathered on an indoor rink',
 'article-iptv.jpg':'A modern home television and living room setup','article-plans.jpg':'A couple watching a film at the cinema','article-devices.jpg':'A couple watching entertainment on a laptop','article-connection.jpg':'A home entertainment setup with a large television','article-picture.jpg':'A mother and son watching television together','article-canada.jpg':'A family enjoying television time at home',
};
export function refreshPhotography(html,route){
 if(route==='/'){
  html=html.replace(/<div class="hero-bg">[\s\S]*?<\/div>/,`<div class="hero-bg" data-hero-slideshow aria-hidden="true"><img class="hero-slide is-active" src="/assets/hero-home.jpg" alt="" width="1920" height="1290" fetchpriority="high"><img class="hero-slide" src="/assets/hero-movies.jpg" alt="" width="1920" height="1280" decoding="async" fetchpriority="low"><img class="hero-slide" src="/assets/hero-hockey.jpg" alt="" width="1920" height="1280" decoding="async" fetchpriority="low"></div>`);
  html=html.replace('<div class="hero-foot">','<div class="hero-scenes" role="group" aria-label="Choose a hero image">'+['TV at home','Movie nights','Live hockey'].map((label,i)=>`<button type="button" data-hero-scene="${i}" aria-pressed="${i===0}"><span class="scene-number">0${i+1}</span>${label}<span class="scene-progress" aria-hidden="true"></span></button>`).join('')+'</div><div class="hero-foot">');
 }
 for(const [old,file]of Object.entries(photoFiles))html=html.replaceAll(old,file);
 html=html.replace(/<img\b[^>]*>/g,tag=>{const file=tag.match(/src="\/assets\/([^"]+)"/)?.[1];return altByFile[file]?tag.replace(/alt="[^"]*"/,`alt="${altByFile[file]}"`):tag;});
 if(route==='/')html=html.replace('href="/assets/viewing-home.jpg" as="image"','href="/assets/hero-home.jpg" as="image"');
 return html;
}
