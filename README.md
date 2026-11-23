# SATEKU — Grill & Street Food

Responsive Indonesian restaurant ordering with 17 sample menu products, quick categories, dine-in table selection, takeaway/delivery, manual QRIS, a public QR menu, and an optional Supabase backend with separate cashier/kitchen staff interfaces.

## Current deployment status
The storefront is published. No Supabase project URL/key has been supplied, so the hosted database connection is **not active**. Until a project is configured, customer orders remain explicitly labeled local demo records and the cashier/kitchen routes show installation instructions. There are no pre-created staff accounts or default passwords. Supabase Auth, hosted Realtime, and actual cross-device receipt of orders cannot be verified until the merchant project exists.

The supplied seller QRIS image/PDF is preserved. A scan/CRC check verifies the code can be read, not that a merchant account is active or that money has arrived. Customer statements never mark payments verified.

## Files and local run
- `dist/index.html`: customer storefront; can be served by any static HTTP server for local-demo use.
- `dist/kasir.html`: cashier login/dashboard.
- `dist/dapur.html`: kitchen login/dashboard.
- `dist/setup-supabase.html`: setup guide.
- `dist/mobile-preview.html`: interactive 375/390/430px iframe preview; not a physical-device screenshot.
- `dist/qr-menu.html`: printable menu QR; `assets/QR-Menu-SATEKU.png` and `Poster-QR-SATEKU.pdf` are included.
- `dist/qris.html`: supplied seller payment QR; distinct from the website/menu QR.
- `supabase/001_schema.sql`: database tables, transactional RPCs, RLS, staff roles, Realtime publication.
- `supabase/002_catalog.sql`: 17 starter products. All initial prices are examples; edit before accepting real orders.
- `supabase/003_staff_example.sql`: role assignment template, not executable default accounts.
- `worker/store.mjs`: public configuration endpoint that refuses secret/service-role keys.
- `worker/payment.mjs`: earlier optional Midtrans integration; disabled by default. The Supabase store checkout currently uses manual QRIS or cash confirmed by cashier; it does not reconcile Midtrans payments into Supabase automatically.

Images and Supabase JS v2.99.3 SDK are bundled locally. Google Fonts uses the internet and has system-font fallbacks. The new soup photograph is AI-generated illustrative menu photography; product images are labeled illustrative.

## Build and host
Node.js 22+ is needed for `node scripts/build.mjs`. The dependency-free build embeds static assets and API code in `dist/server/index.js`, a Cloudflare Worker module. Supabase SQL runs in your own Supabase project; the build does not provision or execute it.

For Sites, retain the existing `.openai/hosting.json` project identity and publish the pushed matching source/build. For other Cloudflare accounts, deploy the Worker under your own account and configure runtime variables. Do not reuse this Sites project identity as a new project. Static-only hosting requires an equivalent public `/api/store/config` endpoint or an adapted public configuration loader; placing `.env` files in a static folder does not configure browser code.

## Connect Supabase
1. Create your own project at https://supabase.com/dashboard and keep its database password private.
2. Run `supabase/001_schema.sql` **once** in SQL Editor. It expects the standard Supabase `auth` schema, anon/authenticated roles, pgcrypto, and `supabase_realtime` publication. Subsequent schema changes should be new migrations rather than replaying this initialization.
3. Run `supabase/002_catalog.sql`. Re-running the seed does not replace existing merchant edits. Adjust prices, availability, photos and actual delivery rules. Initial delivery is an example flat Rp10,000.
4. In Authentication > Users, create separate confirmed staff users with strong passwords. Put actual staff emails into the relevant statements in `003_staff_example.sql`; execute the intended role assignments. Use separate devices/browser profiles for different concurrent staff sessions.
5. Set hosting runtime variables `SUPABASE_URL=https://PROJECT.supabase.co` and `SUPABASE_PUBLISHABLE_KEY=...` using the frontend publishable key or legacy anon key. Both are intended for browser use. Never use `service_role`, `sb_secret_`, a database password, or a management token. Do not send passwords or secret keys through chat.
6. Redeploy to apply runtime settings. Customer storefront switches to the shared database only after catalog loading succeeds; a configured but unavailable database does not silently create a fake local order.
7. Log in at `/kasir.html` with a cashier/admin account and `/dapur.html` with a kitchen/admin account. Normal customer/Auth accounts without staff roles cannot access staff data.
8. Submit a test order from another device. Verify arrival in cashier, payment claim notification, cashier confirmation, kitchen handoff, cooking/ready transitions, cashier completion and customer tracking. Also test wrong-account/anonymous denial and Realtime reconnect behavior in your actual project before business use.

No service-role key is required by this application. Staff permissions are enforced in PostgreSQL, not only by hidden UI. The app does not offer public staff registration or public role changes; the project owner assigns roles through Supabase administration.

## Ordering and privacy
- Public customers read the catalog and call a transactional `sateku_place_order` RPC. Product availability, prices, add-ons, service/table/address, quantities and total are revalidated in PostgreSQL. Browser-supplied totals/status are never used.
- A random 256-bit tracking token is generated per order. Only its hash is stored in the database. The link uses a URL fragment and reveals order status/items, not customer phone/address/name. Save/share this link only with people authorized to view that order.
- Retries use the same request UUID/token and return the same order, preventing duplicate creation for an unchanged request. Order number is a unique receipt identifier, not an external queue/printer number.
- Customers may notify cashier that they paid QRIS. This sets only `customer_claimed_at`; payment remains unpaid until an authorized cashier checks actual receipt of money and confirms it.
- Cash orders are handed to kitchen only after cashier explicitly confirms receipt of cash as well.
- Kitchen receives a separate table containing food, quantities, spice, notes, service, table number and status. It cannot read structured customer names, phone numbers, addresses or payment amounts from the private order table.
- Kitchen can only advance accepted → cooking → ready. Cashier completes ready orders, and can cancel new/accepted orders. Cancellation does not automatically refund money. Staff verification identity/time is recorded. A completed status does not independently prove a payment was received without the earlier cashier verification.
- Staff listens to Supabase Realtime with 15-second polling as a fallback. Sound requires a click on “Aktifkan bunyi” and browser support. Customers poll their token-authorized status every 8 seconds.
- The dashboards display at most the latest 200 orders in 7 days. Historical reporting, physical receipt printers, deliveries, automated refunds, password reset workflows and production abuse protection require additional business configuration/development.
- Local demo admin prices/vouchers never control shared-store totals. Demo vouchers are disabled for shared-store ordering. Merchant catalog can be edited through Supabase Table Editor by the project owner, or by an authenticated admin allowed by RLS.

## Menu additions and sample prices
Tengkleng Rp35,000; Tongseng Rp30,000; Nasi Goreng Rp20,000; Air Mineral Rp5,000; Sop Ayam Rp25,000; Sop Sapi Rp30,000; Es Jeruk Rp8,000; Teh Tawar Rp3,000. Es Teh Manis already exists at Rp5,000. All are sample values, not confirmed merchant prices. Customers with an older local demo receive the new items via a one-time catalog migration; merchant-created local changes are retained.

## Verification performed
SQL was executed against a local PostgreSQL-compatible PGlite database with pgcrypto and simulated Supabase identity roles. Tests covered server price calculation, request idempotency, wrong-token rejection, RLS privacy, no self-assigned staff roles, cashier/kitchen authorization, payment claims staying unpaid, verified kitchen handoff, and valid status transitions. DOM tests cover local ordering and connected customer RPC wiring with mocked Supabase transport. Configuration tests reject server/service-role keys and keep an unconfigured project disconnected.

These tests do not substitute for hosted Supabase/Auth/Realtime tests, actual payment verification, or rendered browser/physical-device QA. The managed browser tool was unavailable.
