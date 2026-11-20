(() => {
  const french=document.documentElement.lang.startsWith('fr');
  const dictionary=__FRENCH_DICTIONARY__;
  const extra={
    'Enquiry':'Demande','Your subscription summary.':'Récapitulatif de votre abonnement.','Catalogue total':'Total de l’abonnement','Amount charged':'Montant payé','You marked your transfer as sent on this device. Payment has not been verified and access has not been activated.':'Vous avez déclaré votre virement comme envoyé sur cet appareil. Le paiement n’a pas été vérifié et l’accès n’a pas été activé.','Your selection is saved on this device. A saved selection does not confirm payment or activate access.':'Votre sélection est enregistrée sur cet appareil. Cet enregistrement ne confirme pas le paiement et n’active pas l’accès.',
    'Switch to light mode':'Passer au mode clair','Switch to dark mode':'Passer au mode sombre','Open navigation':'Ouvrir le menu','Close navigation':'Fermer le menu','Pause decorative animations':'Mettre les animations en pause','Resume decorative animations':'Reprendre les animations','Copy':'Copier','Copied':'Copié','I’ve sent the payment':'J’ai envoyé le virement','Available after review':'Disponible après vérification','One-time trial charge':'Paiement unique pour l’essai','Your plan selection and reference are saved on this device. Contact details are not stored.':'Votre sélection et votre référence sont enregistrées sur cet appareil. Vos coordonnées ne sont pas enregistrées.','Keep a copy of your reference. This browser could not save it.':'Conservez votre référence. Ce navigateur n’a pas pu l’enregistrer.','The recipient address is a placeholder. Do not send a transfer until the recipient is configured.':'Le courriel du destinataire est provisoire. N’envoyez aucun virement avant sa configuration.','Please check the recipient, amount and reference before continuing.':'Vérifiez le destinataire, le montant et la référence avant de continuer.','Message prepared. Nothing has been sent or stored.':'Message préparé. Aucun envoi ni enregistrement.','Message copied. Nothing has been sent.':'Message copié. Rien n’a été envoyé.','Select and copy the prepared message above.':'Sélectionnez et copiez le message ci-dessus.','Name':'Nom','Email':'Courriel','Device':'Appareil','Viewing':'Programmes','Order reference':'Référence de commande','Subscription term':'Durée de l’abonnement','Simultaneous streams':'Diffusions simultanées','Method':'Mode de paiement','Status':'État','Amount charged':'Montant payé','Payment not confirmed':'Paiement non confirmé','Transfer reported · verification pending':'Virement déclaré · Vérification en attente','Awaiting transfer':'En attente du virement','Live TV, movies & series':'Télé en direct, films et séries','Movies & series':'Films et séries','Please confirm availability for these viewing interests: ':'Veuillez confirmer la disponibilité de ces catégories : ',
  };
  const text=value=>{
    if(!french)return value;
    const s=String(value),key=s.trim();
    if(Object.hasOwn(extra,key))return extra[key];
    if(Object.hasOwn(dictionary,key))return dictionary[key];
    if(/^\d+\.\d{2}$/.test(key))return key.replace('.',',');
    if(/^[\d.,\s$]+ CAD$/.test(key))return key;
    return key
      .replace(/(\d+) simultaneous streams?/g,(_,n)=>`${n} diffusion${n==='1'?'':'s'} simultanée${n==='1'?'':'s'}`)
      .replace(/(\d+)-month prepaid term/g,'Abonnement prépayé de $1 mois')
      .replace(/(\d+) viewing categor(?:y|ies)/g,'$1 catégorie(s) de programmes')
      .replace(/(\d+) answers?/g,(_,n)=>`${n} réponse${n==='1'?'':'s'}`)
      .replace(/(\d+) guides?\b(?!\()/g,(_,n)=>`${n} guide${n==='1'?'':'s'}`)
      .replace(/(\d+) month(?:s)?/g,'$1 mois').replace(/(\d+) screens?/g,'$1 écran(s)').replace(/24 hours/g,'24 heures')
      .replace(/monthly equivalent/g,'par mois').replace(/billed for/g,'facturé pour').replace(/billed for the full term/g,'facturé pour la durée totale')
      .replace(/\/month/g,'/mois').replace(/ \/ mo/g,' / mois').replace(/(?<!au) total$/,' au total')
      .replace(/^Copied order reference\.$/,'Référence de commande copiée.').replace(/^Copied amount\.$/,'Montant copié.').replace(/^Copied email\.$/,'Courriel copié.').replace(/^Copied recipient\.$/,'Destinataire copié.')
      .replace(/^Copy this field: /,'Copiez ce champ : ');
  };
  const localPath=url=>french&&url.startsWith('/')&&!url.startsWith('/fr/')&&!url.startsWith('/assets/')?'/fr'+url:url;
  window.LuminaLocale={french,text,localPath};
  const language=document.querySelector('[data-language-toggle]');
  if(language){const path=french?location.pathname.replace(/^\/fr(?=\/)/,''): '/fr'+location.pathname;language.href=path+location.search+location.hash;language.textContent=french?'EN':'FR';}
  if(!french)return;
  const skip=node=>node.parentElement?.closest('script,style,[data-no-translate],.brand-name');
  const apply=root=>{
    if(root.nodeType===Node.TEXT_NODE){if(skip(root))return;const updated=text(root.nodeValue);if(updated!==root.nodeValue.trim())root.nodeValue=root.nodeValue.replace(root.nodeValue.trim(),updated);return;}
    if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE)return;
    if(root.nodeType===Node.ELEMENT_NODE&&root.matches('script,style,[data-no-translate],.brand-name'))return;
    if(root.nodeType===Node.ELEMENT_NODE){for(const attr of ['aria-label','title','placeholder']){if(root.hasAttribute(attr)){const old=root.getAttribute(attr),updated=text(old);if(updated!==old)root.setAttribute(attr,updated);}}if(root.matches('a[href]')&&!root.matches('[data-language-toggle]')){const old=root.getAttribute('href'),updated=localPath(old);if(updated!==old)root.setAttribute('href',updated);}}
    [...root.childNodes].forEach(apply);
  };
  apply(document.body);
  const observerOptions={subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['href','aria-label','title','placeholder']};
  const observer=new MutationObserver(changes=>{
    // Translation writes must never enqueue another translation pass.
    observer.disconnect();
    try{for(const change of changes){if(change.type==='childList')change.addedNodes.forEach(apply);else apply(change.target);}}
    finally{observer.observe(document.body,observerOptions);}
  });
  observer.observe(document.body,observerOptions);
})();
