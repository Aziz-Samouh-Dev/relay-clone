import referencePricing from './pricing.json' with {type:'json'};
export const site = {
  name: 'Lumina Stream',
  tagline: 'A better kind of TV time.',
  origin: 'https://relay-studio-clone-1120.handygait32.chatgpt.site',
  locale: 'en-CA',
  currency: 'CAD',
  indexing: false,
  preview: true,
  updated: '2026-11-20',
  supportEmail: '',
  paymentLinks: {},
};
export const plans = referencePricing.plans;
export const trial = {id:'trial', name:'24-hour trial',months:0,price:2.99,note:'Try it on your own screen.'};
export const faqs = [
  {group:'Getting started',q:'What is IPTV?',a:'IPTV means Internet Protocol Television: television delivered through an internet connection instead of a satellite dish or traditional cable connection. You need a compatible device, a player and an active subscription from a provider with rights to distribute the content.'},
  {group:'Getting started',q:'Is Relay TV available to buy today?',a:'This is a website preview. Example plans, prices and viewing categories show how the service will work. No subscription is sold or activated here. Final availability, content rights and payment details must be confirmed before launch.'},
  {group:'Getting started',q:'Can I check a specific channel before choosing a plan?',a:'Yes. Use the channel request tool to build a list of the channels, languages or programmes that matter to you. Ask support to confirm the exact lineup for your country and plan before you pay. The categories shown on this preview are not a confirmed channel catalogue.'},
  {group:'Plans & billing',q:'What currency are the prices in?',a:'All example prices are in Canadian dollars (CAD). Each card shows the total for the selected term and the equivalent monthly cost. Applicable taxes, final prices and any other charges must be disclosed before a live payment is accepted.'},
  {group:'Plans & billing',q:'Will my subscription renew automatically?',a:'The proposed plans are prepaid for a fixed term with no automatic renewal. That proposed policy must be confirmed in the final service terms before the site accepts orders.'},
  {group:'Plans & billing',q:'How many screens can I watch at once?',a:'Choose one, two or three simultaneous streams. Prices vary by server, term and stream count; the plan cards and checkout use the same price table. Household rules and actual service availability must be confirmed before purchase.'},
  {group:'Plans & billing',q:'How does the 24-hour trial work?',a:'The proposed trial costs CAD 2.99, lasts 24 hours and covers one stream. Use it to check your device, connection and requested channels. This preview cannot sell or activate a trial; the final trial terms will be shown before launch.'},
  {group:'Devices & setup',q:'Can I use the TV I already own?',a:'Possibly. Compatibility depends on your TV model, operating system, regional app store and the player supported by the final service. Check the device guide before ordering. A compatible streaming device connected by HDMI may be an alternative.'},
  {group:'Devices & setup',q:'Does an IPTV player include a subscription?',a:'No. A player is software that plays a stream or playlist. Content access is separate, and some players charge their own fee. Only enter credentials issued by your authorised service provider.'},
  {group:'Devices & setup',q:'What do I need before setup?',a:'Have your device model, a stable internet connection, a compatible player and the connection details supplied by your provider ready. Install software from the official app store or developer source. Keep account credentials private.'},
  {group:'Streaming & support',q:'Why does a stream buffer?',a:'Buffering can come from a weak Wi-Fi signal, network congestion, device limitations or the content source. First compare another app on the same device, restart the player, try Ethernet where available and test a lower playback quality. If only one channel fails, tell support which channel and when it happened.'},
  {group:'Streaming & support',q:'Is 4K available on every channel?',a:'No. Picture quality depends on the source, your plan, device, player, display and network. A 4K-capable television cannot turn every source into native 4K. Confirm the resolution of the channels you care about before buying.'},
  {group:'Streaming & support',q:'What should I include in a support request?',a:'Share your device model, player name, a description of the issue, the affected channel or title, and when it happened. Never put your password, full playlist URL or payment information in a public message.'},
  {group:'Trust & availability',q:'How can I check a provider’s content permissions?',a:'Ask the provider which content it is authorised to distribute and in which countries. Confirm the business identity, service terms, refund policy and payment route before purchasing. A large channel count alone does not establish that a provider has permission to distribute the content.'},
  {group:'Trust & availability',q:'Can I watch while travelling?',a:'Country restrictions and account rules may limit access when you travel. Check the permitted territory and household rules before relying on the service outside your usual location. A VPN does not change the provider’s distribution rights.'},
];
export const devices = [
  {id:'fire-tv',name:'Fire TV',category:'TV devices',icon:'stick',text:'A familiar remote. A screen you already love.',detail:'Check your Fire TV model and the compatible player in your regional Amazon Appstore before ordering.'},
  {id:'android-tv',name:'Android & Google TV',category:'TV devices',icon:'tv',text:'Bring your evenings to the big screen.',detail:'Confirm the app is built for your TV operating system; a phone app is not necessarily a TV app.'},
  {id:'smart-tv',name:'Samsung & LG TVs',category:'Smart TVs',icon:'tv',text:'Keep your setup simple.',detail:'App availability varies by model year, region and whether your TV runs Tizen or webOS.'},
  {id:'apple-tv',name:'Apple TV',category:'TV devices',icon:'box',text:'Your living room, beautifully connected.',detail:'Check the tvOS App Store for a player compatible with the credentials supplied by your provider.'},
  {id:'mobile',name:'iPhone & Android',category:'Mobile',icon:'phone',text:'A smaller screen. The same favourite moments.',detail:'Check mobile data usage and country restrictions. Your player and provider must both support your phone.'},
  {id:'computer',name:'Windows & Mac',category:'Computers',icon:'laptop',text:'Make room for a little downtime.',detail:'A compatible desktop player may support your provider’s playlist. Use only official software downloads.'},
];
