export function storefrontCopy(text){
 const replacements=[
 ['and preview a simpler way to choose your television.','and choose a simpler way to enjoy your television.'],
 ['before the preview checkout.','before checkout.'],
 ['the proposed 24-hour IPTV trial','the 24-hour IPTV trial'],
 ['the Lumina Stream preview.','Lumina Stream.'],
 ['Learn what is included in this website preview.','Explore live channels, movies, series and flexible subscription terms.'],
 ['The Lumina Stream preview lets you copy your message without sending or storing personal information.','Prepare and review your complete channel, device or subscription enquiry.'],
 ['How this website preview handles your information.','How Lumina Stream handles your information and browser preferences.'],
 ['What you need to know about this website preview.','Subscription terms, device compatibility and the details to check before purchasing.'],
 ['Refund information for the Lumina Stream website preview.','How to prepare a refund enquiry and what to check before subscribing to Lumina Stream.'],
 ['IPTV Plans & Example Prices in CAD','IPTV Subscription Plans & Prices in CAD'],
 ['24-Hour IPTV Trial Preview','24-Hour IPTV Trial'],
 ['PROPOSED TRIAL','24-HOUR TRIAL'],
 ['This preview cannot take a payment or activate access.','Choose the trial to check your setup before a longer commitment.'],
 ['About this guide: written for the Lumina Stream preview.','About this guide: practical advice from Lumina Stream.'],
 ['This is a contact preview. Messages are not sent or stored. The operator’s support details must be added before launch.','Prepare your channel, device or subscription enquiry below. You can review and copy the complete message.'],
 ['Preview Your IPTV Plan & Checkout','Your IPTV Subscription & Checkout'],
 ['Configure an example IPTV plan','Configure your IPTV subscription'],
 ['Review your order and preview checkout without making a payment.','Review your subscription details and payment availability.'],
 ['Preview only. Your details stay in this page’s memory and are cleared when you leave or refresh. No card information is requested.','Your details stay on this page until you choose a payment option. We do not ask for card information on this form.'],
 ['Your preview details.','Your details.'],
 ['Payments are not connected.','Payment availability.'],
 ['This preview cannot charge you, send an order or activate a subscription. A verified merchant payment provider and final service terms must be connected before launch.','Online payment is currently unavailable. Your subscription has not been ordered or activated. Please contact us before sending any payment.'],
 ['Do not send a bank transfer or payment to any account from a reference website. No payment recipient is configured here.','Only use the payment destination supplied for your own order. Never use details copied from another website.'],
 ['I understand this is an order preview, with no purchase.','I have checked my plan, subscription term and screen count.'],
 ['Preview confirmation','Continue to payment'],
 ['Manual · proposed','Manual renewal'],
 ['<span>Availability</span><strong>To be confirmed</strong>','<span>Currency</span><strong>Canadian dollars</strong>'],
 ['Final prices and any applicable taxes must be confirmed before live orders open. Amount charged here: $0.','Review all applicable charges before paying. A summary does not confirm a purchase or activate access.'],
 ['Order Preview Confirmation','Your Subscription Summary'],
 ['Review the end of the Lumina Stream checkout preview. No payment has been taken, no order submitted and no subscription activated.','Review your selected subscription and check the status of your purchase.'],
 ['Checkout preview complete','Your subscription selection'],
 ['Your checkout preview is complete. No payment was taken, no order was submitted and no subscription has been activated.','Your plan selection is shown below. A summary alone does not confirm payment or activate a subscription.'],
 ['Your preview summary.','Your subscription summary.'],
 ['Choose a plan and complete the preview checkout to see its summary here.','Choose a subscription plan to see the full summary here.'],
 ['Your contact details are not stored or sent. Only the selected example plan and stream count appear in this URL.','Only your selected plan, subscription term and stream count appear in this address.'],
 ['Your evening.<br><span>On a different<br>level.</span>','Live TV. Movies.<br><span>Your next great<br>night in.</span>'],
 ['Live moments. New discoveries. Old favourites.<br>A thoughtfully connected TV experience, on the screen that feels like home.','Choose your IPTV subscription for live channels, movies and series. Flexible terms. Clear CAD pricing. One, two or three screens.'],
 ['Less searching. More settling in.','Live channels · Movies · Series'],
 ['Find your plan','Choose your subscription'],
 ['A shorter commitment or a longer stay. See the full example price before you make a choice.','Your choice of server, term and screens. See the total, choose your subscription and get ready for your next night in.'],
 ['LIVE TV plan','Live TV plan'],
 ['Live TV plan · lineup to confirm','Live TV, movies & series'],
 ['No automatic renewal proposed','Prepaid term · no automatic renewal'],
 ['Canada-focused website preview.<br>Service availability to be confirmed.','Live television, movies and series.<br>Choose your plan. Make it your evening.'],
 ['VIEWING PREVIEW','LIVE TV · MOVIES · SERIES'],
 ['Illustrative viewing interface. Final content availability to be confirmed.','Live channels, movies and series, on the screen you love.'],
 ['Viewing categories are illustrative, not confirmed channel or programme availability.','Looking for a particular channel? Ask about your country and preferred lineup before choosing a plan.'],
 ['A clearer channel list','Find your favourites'],
 ['These are viewing interests, not a confirmed channel catalogue. Specific channels, programmes, resolution and regional availability must be checked before purchase.','Explore live TV, movies, sports and international viewing. Tell us the exact channels and languages you want so we can help you choose the right plan.'],
 ['example price','price'],['Example prices','Prices'],['example prices','prices'],['Example total','Total'],['example total','total'],['Example plans','Subscription plans'],['example plans','subscription plans'],['example IPTV','IPTV'],['example plan','subscription plan'],['Example plan','Subscription plan'],['example trial','trial'],
 ['This preview cannot sell or activate a trial; the final trial terms will be shown before launch.','Choose the trial to test your device and favourite channels before a longer subscription.'],
 ['The proposed trial','The trial'],['The proposed plans','The plans'],['proposed plans','plans'],['the final service','the service'],['your final service','your service'],
 ['Choose Duck, Edge, Raccoon, Trex or the on-demand Ciné Pack. Terms are 1, 3, 6 or 12 months, with 1–3 simultaneous streams. Prices are in CAD and match the supplied reference catalogue. Payment and activation are not connected.','Choose Duck, Edge, Raccoon, Trex or the on-demand Ciné Pack. Subscribe for 1, 3, 6 or 12 months and select 1–3 simultaneous streams. All prices are in Canadian dollars.'],
 ['The example trial is CAD 2.99 for 24 hours on one simultaneous stream. This preview cannot take a payment or activate access.','The trial is CAD 2.99 for 24 hours on one simultaneous stream. Check your device, connection and favourite channels before choosing a longer term.'],
 ['Preview the trial checkout','Get the 24-hour trial'],['No payment taken. No access issued.','24 hours · 1 screen · CAD 2.99'],
 ['These checklists help you confirm those details.','Choose your device below for a practical setup checklist.'],
 ['The Relay journal','The Lumina journal'],
 ];
 for(const [from,to]of replacements)text=text.replaceAll(from,to);
 return text;
}
export function businessPage(route){
 const headings={
  '/about/':['About Lumina Stream','Your channels.<br>Your movies.<br><span class="chrome">Your kind of TV.</span>'],
  '/privacy/':['Privacy','Your information.<br><span class="chrome">Handled thoughtfully.</span>'],
  '/terms/':['Service terms','The details.<br><span class="chrome">Before you subscribe.</span>'],
  '/refund-policy/':['Refund information','A clearer view.<br><span class="chrome">Before you pay.</span>'],
 };
 if(!headings[route])return null;
 const [eyebrow,title]=headings[route];
 const bodies={
 '/about/':`<p>Lumina Stream brings live television, films and series into one subscription experience. Choose Duck, Edge, Raccoon, Trex or the on-demand Ciné Pack, with flexible terms and one to three simultaneous streams.</p><h2>Your viewing. Your choice.</h2><p>Pick the term that works for you: one, three, six or twelve months. Compare the full price in Canadian dollars, check your preferred device and choose the number of screens your household needs.</p><h2>Start with the things you love.</h2><p>Live channels, entertainment, sports, family viewing and international programming. Tell us the exact channels and languages you want, and we’ll help you choose a suitable plan.</p><div class="actions"><a class="btn primary" href="/subscription/">Choose your subscription</a><a class="btn" href="/channels/">Explore viewing categories</a></div>`,
 '/privacy/':`<p>Updated 20 November 2026.</p><h2>Your information on this website.</h2><p>The subscription configuration and contact preparation tools keep your contact entries in page memory. They do not send your name or email address to a server. Leaving or refreshing the page clears those entries.</p><h2>Saved order selections.</h2><p>Your browser can save the selected plan, term, stream count, total and order reference on this device. Names and email addresses are not included in that saved record. This local record is not a server-confirmed order or proof of payment.</p><h2>Preferences and technical requests.</h2><p>Your browser may remember whether you paused decorative animations. This website does not use advertising trackers. The hosting provider may process technical request data to deliver and secure the website.</p><h2>Payment information.</h2><p>No card fields are hosted on this website. Interac transfers are made through your own bank. Use only verified recipient details. Never include passwords, full playlist URLs or card details in an enquiry.</p>`,
 '/terms/':`<h2>Choose your subscription.</h2><p>Plans are priced in Canadian dollars. Terms are one, three, six or twelve months, with one, two or three simultaneous streams. Your order summary shows the selected server, duration, screen count and total.</p><h2>Check your setup.</h2><p>Device and player compatibility varies by model, operating system and app availability. Confirm the channels and regional feeds important to you before purchasing. Picture quality depends on the source, device and connection.</p><h2>Keep account details private.</h2><p>Use your access details only with a compatible player. Do not publish passwords or playlist URLs. A simultaneous-stream allowance does not automatically permit account sharing between separate households.</p><h2>Before payment.</h2><p>Review the complete order and any applicable charges. Payment availability is shown at checkout. Access is not activated by viewing an order summary.</p>`,
 '/refund-policy/':`<h2>Check before you pay.</h2><p>Review the plan, subscription term, number of streams and total. If you need to confirm a channel or device, ask before making a payment.</p><h2>Need help with a purchase?</h2><p>Prepare a request with your order reference, purchase date and the issue you are experiencing. Do not include a full payment card number, password or unredacted playlist URL.</p><h2>Trial and service issues.</h2><p>The 24-hour trial is a shorter way to check your setup before a longer subscription. Ask about the refund conditions applicable to your order before payment. No fixed refund period or unconditional guarantee is advertised here.</p><a class="btn primary" href="/contact/?topic=Plans%20%26%20billing">Prepare an enquiry</a>`
 };
 return `<section class="page-hero"><div class="wrap"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>${eyebrow}</span></nav><span class="eyebrow">${eyebrow}</span><h1>${title}</h1></div></section><section class="section small"><div class="wrap prose">${bodies[route]}</div></section>`;
}
