# Existing relay-clone Worker integration

The root `wrangler.jsonc` supplies a Worker entry point alongside the existing `dist` assets. This replaces the static-assets-only deployment configuration when the next approved deployment runs. No new Worker, D1 database, R2 bucket or website is needed.

Resources configured:

| Binding | Existing resource |
| --- | --- |
| DB | lumina-db, 907cf85d-f371-41ab-aeaf-aeb5edac386c (owner supplied) |
| INVOICES | lumina-invoices, private R2 bucket |
| ASSETS | Existing dist directory |

`server/worker.mjs` is the existing commerce backend. It is bundled into `.worker-build/index.js`; `/api/*` runs through it first. Other requests retain Cloudflare static asset handling and the original EN/FR HTML, CSS, images, canonical URLs, sitemap and robots file. Missing pages remain 404. `/api/health` returns only `{"ok":true,"service":"lumina-api"}` and does not require database tables or expose configuration.

## GitHub automatic Cloudflare builds

Inspect these settings in **Workers & Pages → relay-clone → Settings → Builds** before an approved push. This repository cannot read or change the dashboard settings without account access.

- Root directory: the directory containing this package.json and wrangler.jsonc (repository root for this checkout).
- Install command: npm ci, or Cloudflare's standard dependency installation.
- Build command: npm run build:cloudflare. The existing npm run build also generates both frontend and Worker outputs.
- Deploy command: npm run deploy:cloudflare. Standard npx wrangler deploy also reads the same configuration and runs its custom build when invoked directly.
- Non-production version uploads, if enabled: npx wrangler versions upload. Use separate preview resources if preview API writes are desired; the root configuration references production resources.
- Worker name: relay-clone. Remove old static-only upload commands that bypass Wrangler configuration.

Workers Builds uses its dashboard build command; it does not honor Wrangler custom builds there. Both commands above build the Worker explicitly. No migration command is included in build, deploy or version-upload scripts. Do not push these changes to an auto-deployed branch until deployment is approved. No GitHub Actions workflow is added because Cloudflare already owns the automatic builds.

## Local validation

```sh
npm ci
npm run build:cloudflare
npm run check
npm test
npm run db:migrate:local
npm run dev:cloudflare
```

Wrangler uses port 8787, isolated local D1/R2 state under ignored `.wrangler`, and no remote bindings. The existing npm start loopback preview remains available on port 4173 with its separate `.local` database. Current Wrangler loads the ignored .env.local for local development (as confirmed during validation). An ignored .dev.vars file can instead provide explicit local-only secrets; when present it takes precedence over dotenv files. Never commit populated secret files. Health and static assets work without those secrets.

With the local emulator running, use `npm run check:worker:local` for a repeatable HTTP smoke test. This creates a test order only in local D1 and checks private PDF storage in local R2; it never sends emails.

Check `/api/health`, `/api/catalog`, `/`, `/fr/`, `/checkout/`, `/fr/checkout/`, `/robots.txt` and `/sitemap.xml`. `npm run check:cloudflare` performs Wrangler's dry run only. It builds and validates the bundle/bindings, without uploading or migrating production data.

## Migrations and approval sequence

Existing numbered SQL migrations are retained, not rewritten:

- 0001_commerce.sql: customers, orders, payment quotes and claims, invoices, subscriptions, settings, sessions, audit and delivery records, indexes and state-protection triggers. Payments are represented by quotes/claims plus order payment status, not a duplicate payment ledger.
- 0002_subscription_delivery.sql: encrypted subscription access delivery records.

Local migration command explicitly uses --local. Before any approved remote migration, inspect the existing D1 schema and migration history and back up/export existing records. These initial CREATE TABLE migrations are intended for a database without an existing commerce schema; reconcile any existing tables first. Local records and secrets are not copied to Cloudflare.

Only after explicit owner approval, an operator can apply `npx wrangler d1 migrations apply DB --remote` and deploy the same Worker via the approved build workflow. Neither action was performed during this integration.

Configure runtime secrets on the existing Worker before live checkout: ORDER_SECRET, SETTINGS_KEY, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, and optionally EMAIL_API_KEY. Use Cloudflare secret controls or wrangler secret put, never vars in the tracked configuration for secret values. Keep ORDER_SECRET and SETTINGS_KEY stable so order access links and encrypted settings remain readable. AUTH_MODE=password is already configured. LOCAL_DEV must not be set in production.

After migration/deployment, configure seller, tax, receiving account and verified sender in the authenticated admin settings. Existing defaults remain test mode. Keep the R2 bucket private; invoice downloads go through authorization in the API.

## Validation completed

- 80 static pages, 3,400 internal references and 80 JSON-LD graphs passed site checks.
- French translation/theme runtime checks and all 12 backend/configuration tests passed.
- Wrangler dry run validated the Worker, 209 static assets and DB/INVOICES/ASSETS bindings.
- Both SQL migrations applied successfully to local Cloudflare D1.
- Local workerd HTTP smoke test confirmed unchanged EN/FR pages and SEO files, checkout, catalog, health, unauthorized access rejection, idempotent D1 order creation and private R2 PDF storage/retrieval.

Cloudflare account/dashboard settings and the remote database schema were not accessible in this session. The D1 UUID was provided by the owner, not looked up via the Cloudflare API. No remote resource creation, migration, upload, deployment, Git commit or push was performed.
