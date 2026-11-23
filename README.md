# Lumina Stream

The local code now includes a durable order/payment/invoice backend and bilingual administration. Read [COMMERCE.md](COMMERCE.md) for the current architecture, local login setup, database migration, Cloudflare bindings, test results and production configuration requirements. Production has not been changed. Earlier notes below describe the prior static storefront and its history.

A 35-page IPTV storefront with real stock photography, a unique photo for every Journal article, a large animated device banner, subscription comparisons, setup guides and Interac checkout instructions.

## Run

Requires Node.js 22 or newer. No dependencies need installing.

```sh
npm run build
npm run check
npm start
```

Open http://localhost:4173. Set PORT for a different port. Rebuild after source changes.

## Edit

- source/site.config.mjs: brand, domain, FAQ, devices and Interac recipient configuration.
- source/pricing.json: the owner-approved CAD catalogue for Duck, Edge, Raccoon, Trex and Cine Pack, plus trial settings in site.config.mjs.
- source/pricing-components.mjs: subscription cards and comparison table.
- source/articles.mjs: original Journal articles and their six different photographs.
- source/storefront.mjs: sales copy and business information pages.
- source/interac.mjs: recipient, exact amount, memo and copy-button payment layout.
- source/app.js: interactive controls, local order selections and recipient guard.
- source/styles.css: responsive design, hero motion, purchase-button emphasis and device marquee.
- source/build.mjs: generated HTML, metadata, structured data, sitemap and robots.
- PHOTO-SOURCES.md: the real photography source list.
- dist/: static deployment output.

## Prices

The owner requested the same price catalogue as TVSLine. The snapshot includes five plans, four terms and three stream counts, plus the CAD 2.99 trial. A scheduled price in the supplied reference makes the Raccoon 12-month, one-stream total CAD 180 as of 20 November 2026. All displayed totals and Interac amounts use the same catalogue, without percentage approximations.

## Interac setup and current behavior

The owner requested placeholder contact information. source/site.config.mjs therefore has payments@example.com and interac.configured=false. The checkout shows the requested recipient / email / amount / memo layout, but disables the payment-sent action while the recipient is a placeholder. It does not copy the reference company's identity or payment address.

To configure the real recipient, set the actual legal recipient name and email, then set interac.configured=true. The client additionally rejects reserved example.com/.net/.org recipient addresses. Bank transfers occur in the buyer's banking app, not on this website.

When a visitor reviews an order, the site generates a LUM- reference and stores the selection on that browser: plan, term, stream count, total, currency and status. It does not store names or email addresses. This is a local record, not a server-confirmed order. A production order database, payment verification, fulfilment and activation email delivery are not connected. Those must be implemented before claiming server-saved orders, verified receipt or automatic activation.

The contact form prepares a message for copying and does not send it. A real support destination is still required for email submission.

## Search

Pages are static HTML with unique metadata, canonical URLs, breadcrumbs, social metadata and JSON-LD. The sitemap excludes transactional pages. The owner-private Site retains noindex and disallowed crawling. Public access and a real canonical domain must be configured for public Google/AI discovery; no indexing or ranking has been claimed.

## Checks

npm run check covers all 35 pages, 1,390 internal references, valid JSON-LD, unique metadata, six different Journal images, the device banner and placeholder Interac guard. Browser QA checked pricing consistency, copy controls, generated references, mobile field overflow, Journal filtering, image loading and removal of example-plan labels.

The original Relay snapshot remains in reference-relay/ and Git history. Earlier generated artwork is retained for history but is not referenced by current pages.

## Canada, French and light mode

The site now has 32 English and 32 French pages, matching language switches, localized metadata and hreflang links. Light mode persists on the visitor's device. Checkout fixes Canada without a country or city selector. City landing pages and links were removed. Automated checks cover all 64 pages and em dash removal. This update's browser QA could not complete because the in-app browser connection timed out.


French runtime fix: translation observer disconnects while applying its own changes, and dynamic counters are idempotent. Theme defaults to the operating system and cycles System, Light, Dark. node scripts/check-locale-runtime.mjs checks observer settling and theme persistence/system changes.


Canada search update: public indexing enabled at the owner's request. Main English/French pages target IPTV Canada with unique titles, descriptions, homepage/plan headings and a visible Canada FAQ section matching FAQPage markup. Organization/WebPage/Service markup identifies Canada without invented offices or city pages. robots.txt permits crawling; checkout and confirmations retain noindex and stay out of the sitemap. Search indexing and AI citations are not guaranteed. Existing placeholder payment guard remains active.


Photography refresh: 12 new local stock photographs replace every previous photo reference across English and French pages. The homepage has three dedicated slides, soft blur/crossfade transitions, manual scene buttons, motion pause, hidden-tab pause and reduced-motion support. Browser QA verified image loading, scene switching, French labels and no overflow at 390px. PHOTO-SOURCES.md records sources.


Plan redesign: each subscription card has independent duration/device selectors and distinct features taken from the owner's supplied comparison screenshot. Channel/library counts, Canada hosting and support/activation descriptions are owner-provided service specifications, not independently measured statistics. Shared pricing tables remain unchanged. Comparison table includes plan highlights. Text action links use natural height across the entire site.

