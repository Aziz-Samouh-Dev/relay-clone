# Relay Studio clone

A static copy of the public Relay demo at https://relay-theme.pages.dev/, the site shown inside the AeroLaunch preview supplied in the request. The demo wrapper is excluded so the actual website occupies the full browser window.

## Run locally

Requires Node.js. No package installation or build is needed.

```sh
npm start
```

Open http://localhost:4173. Run `npm run check` to check the page inventory, local references, and interaction bundle.

## Included pages

- `/`
- `/work/`
- `/work/aera/`
- `/work/pace/`
- `/work/form-field/`
- `/services/`
- `/services/brand-identity/`
- `/services/web-design/`
- `/services/digital-products/`
- `/services/ecommerce/`
- `/services/content/`
- `/services/ongoing-support/`
- `/industries/`
- `/about/`
- `/blog/`
- `/blog/before-you-redesign/`
- `/blog/space-to-breathe/`
- `/blog/after-the-launch/`
- `/contact/`
- `/privacy/`

## Behavior

The original public HTML, CSS, font files, images, and browser JavaScript are local in `dist/`. This preserves the original smooth scrolling, entrance animations, line reveals, parallax, stacked project cards, process counter, animated project preview, logo marquees, testimonial controls, work filters, navigation menus, FAQ accordions, pricing toggle, and persisted light/dark and accent preferences. Reduced-motion behavior is preserved.

The contact form retains the reference site's demo behavior: it validates fields and displays the demo notice. Email delivery requires configuring a real backend. No third-party email submission has been added. The original creator attribution remains in the footer.

`mirror-manifest.json` records the source route and local file for all downloaded pages and assets. `scripts/mirror.mjs` can refresh the public reference snapshot; it overwrites files in `dist/`.

## Deployment

`dist/` is the complete static site, suitable for any static host that serves directory `index.html` files. `.openai/hosting.json` holds the registered private Sites deployment configuration.
