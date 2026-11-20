# Lumina Stream

A 35-page responsive IPTV storefront based on the cinematic Relay design, with TVSLine-inspired page structure, original copy and a three-step checkout preview.

## Run and edit

Node.js 22 or newer. No dependency installation needed.

```sh
npm run build
npm run check
npm start
```

Open http://localhost:4173. Set PORT to use another port. Rebuild after editing source.

- source/site.config.mjs: brand, canonical origin, currency, indexing flag, FAQ and device content.
- source/pricing.json: single price catalogue used by cards, comparisons, checkout and confirmation.
- source/pricing-components.mjs: plan presentation and comparison.
- source/articles.mjs: six original journal articles.
- source/build.mjs: static HTML, metadata, JSON-LD, sitemap and robots generation.
- source/styles.css and source/app.js: presentation, responsive layouts and interactions.
- dist/: complete deployable static site.
- reference-relay/: preserved original Relay snapshot, excluded from deployment.
- site-manifest.json: generated route and metadata inventory.

## Pages

Home, subscriptions, trial, channel interests, devices, setup index, six device guides, FAQ, journal index, six articles, four category archives, about, Canada/Quebec/Montreal/Toronto checklists, contact, checkout, confirmation, privacy, service terms and refund information. A custom 404 page is also included.

## Owner-specified pricing

The owner confirmed the Lumina Stream brand and requested TVSLine pricing. The snapshot comes from the public reference checkout catalogue on 20 November 2026. It includes Duck, Edge, Raccoon, Trex and Cine Pack, with 1/3/6/12-month terms and 1/2/3 simultaneous streams, plus a CAD 2.99 24-hour trial.

The reference includes a scheduled Raccoon change effective 1 November 2026: 12 months and one stream costs CAD 180. Some static HTML still shows CAD 120. This site uses the effective checkout value, CAD 180. Other stream counts are unchanged. The catalogue excludes reference trackers, payment recipients, support accounts and API endpoints.

## Current behavior

Pricing uses the exact catalogue, including distinct prices for every duration and stream count. The trial is fixed to 24 hours and one stream. Cine Pack is labelled on demand, without live channels.

Checkout holds customer entries only in page memory, displays a review, then shows an explicit preview confirmation. No order, payment or activation occurs. Personal details never enter the confirmation URL. Contact prepares a local message for copying; it does not send or store enquiries.

The operator identity, domain, support destination, payment provider, actual channel catalogue, distribution permissions and final policies are still missing. No invented ratings, customer counts, channel counts, uptime guarantees or testimonials are published.

## SEO, AEO and GEO

All pages are static HTML with readable content, unique titles/descriptions, canonical URLs, social metadata, breadcrumbs and internal links. Organization, WebSite, WebPage, FAQ and article structured data matches visible content. The sitemap excludes checkout and confirmation. Images have alt text, the local font uses font-display swap, below-fold images are lazy loaded and reduced-motion preferences are supported.

Answer-first sections, focused questions, comparison tables and original guides support readers and search systems. No special AI files or ranking guarantees are used. Google says normal SEO foundations apply to its AI search features: https://developers.google.com/search/docs/appearance/ai-features

The existing Site remains owner-private and indexing is disabled in source/site.config.mjs. Robots disallows crawling and page metadata specifies noindex during the business preview. A private preview cannot appear in public Google or AI results.

Before a public search launch:

1. Set the actual domain, operator identity, support contacts and final service catalogue.
2. Connect a real payment provider and order/activation backend. Validate prices and signed payment callbacks on the server. Never fulfil an order based only on a browser confirmation.
3. Confirm content rights and territories, actual device support, final taxes, trial terms, renewal and refund policies. Replace preview copy with confirmed details.
4. Approve public access, enable site.indexing, remove preview notices when the service is actually live, rebuild and redeploy.
5. Verify the domain in Google Search Console, submit /sitemap.xml, validate structured data and review crawl/performance results. No Search Console submission has been made here.

## Validation

npm run check checks all generated pages, internal links/assets, unique metadata, canonical URLs, language attributes, JSON-LD syntax and checkout/sitemap boundaries. Browser QA covers desktop and mobile rendering, navigation, reference pricing, trial constraints, checkout review and confirmation, FAQ search, blog filters, channel requests and local enquiry preparation.

The original source is retained in Git history and reference-relay/. The existing private Site identity is preserved in .openai/hosting.json.

## Assets

Rethink Sans was retained from the Relay reference. The current television, cinema and sports artwork was created with the built-in image generation tool. See ARTWORK.md for asset paths and prompts. The artwork is illustrative and does not represent a programme or channel catalogue.
