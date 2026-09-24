# ShopifyDataBridge

ShopifyDataBridge converts Shopify CSV exports into TradingWEB's import
contract. It does not write TradingWEB database tables directly.

## Runtime path

```text
Shopify CSV
  -> parse / sanitize
  -> map stable Shopify source IDs
  -> create TradingWEB import session
  -> POST standard import envelope
  -> TradingWEB validation / idempotent receiver / transaction
  -> TradingWEB database
```

Products, variants, customers, orders, addresses and line items keep their
Shopify IDs as source identities whenever the export provides them. TradingWEB
uses those identities in `external_source_mappings` for retries and reference
resolution.

## Authentication

There are two separate credentials.

DataBridge uses Supabase only to verify the person opening the migration UI.
A valid Supabase account is not enough: the account email must also appear in
`MIGRATION_ADMIN_EMAILS`.

TradingWEB writes use a server-side bearer credential from
`TRADINGWEB_IMPORT_TOKEN`. The browser never receives this token.

Required environment:

```env
# DataBridge login identity only
COZE_SUPABASE_URL=https://...
COZE_SUPABASE_ANON_KEY=...
MIGRATION_ADMIN_EMAILS=admin@example.com,operator@example.com

# TradingWEB import receiver
TRADINGWEB_API_URL=https://fjglobal.online/api
TRADINGWEB_IMPORT_TOKEN=<active TradingWEB admin/operator bearer token>
SHOPIFY_SOURCE_STORE=my-shop.myshopify.com
```

DataBridge does not use a Supabase service-role key for migration.

## Imports

Supported sender paths:

- products + variants + images + inventory quantity;
- customers + addresses;
- historical orders + line items.

Order imports depend on the same `SHOPIFY_SOURCE_STORE` namespace used for the
earlier product/customer imports so TradingWEB can resolve source mappings.

Migration logs and reconciliation are read back from TradingWEB import
sessions. `migration_id` in the DataBridge UI is the TradingWEB
`session_id`.

## Validation

TradingWEB owns target-side validation. DataBridge performs CSV parsing and
input sanitization before submission; TradingWEB validates the envelope,
references and target constraints before accepting records.

After an import, DataBridge reads the TradingWEB session reconciliation result
rather than querying a second copy of the target database.

## Architecture correction

The first public version still carried a more direct migration shape. A later audit moved
target writes behind TradingWEB's import receiver and removed DataBridge's service-role
escalation/direct target-database ownership. Regression tests now prevent reintroducing
direct target writes and require explicit migration-administrator authorization.

This correction is visible in `fix: route migrations through the TradingWEB receiver (#2)`.

## Verification

```bash
pnpm install --frozen-lockfile
pnpm validate
pnpm test
```

CI runs the same TypeScript/lint/test gates on `main` and pull requests.

## Run

```bash
pnpm install
pnpm dev
```

## Scope

This is a Shopify-to-TradingWEB migration adapter, not a general ETL platform.
TradingWEB remains the owner of target schemas, transactions, idempotency and
business data.

## Stack

Next.js · React · TypeScript · PapaParse · Supabase Auth · Vitest
