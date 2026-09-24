# ShopifyDataBridge — Development and Boundary Record

This document records why the project became a narrow migration adapter. Current code,
tests, CI and the TradingWEB receiver contract take precedence over older scaffold
descriptions.

## 1. Scope reduction

The project began from a broader commerce scaffold. Once TradingWEB became the system that
owned products, customers, orders, transactions and business rules, maintaining another
partially independent commerce system created duplicate authority.

The boundary was reduced to:

```text
Shopify export
  -> parse / sanitize / map source identity
  -> TradingWEB import envelope
  -> TradingWEB validation + idempotency + transaction
```

DataBridge should not own target database tables or business transactions.

## 2. Audit correction: direct writes were removed

A later review found that the migration layer still had too much target-side authority.
The repair:

- routes product/customer/order migrations through the TradingWEB receiver;
- removes direct target-database writes from the CSV pipeline;
- removes service-role escalation for migration;
- requires an explicit migration administrator allowlist;
- reads migration/reconciliation state back from TradingWEB sessions;
- adds tests that prevent direct target-database writes from returning.

This is the current architecture. Historical descriptions of DataBridge as a standalone
migration backend should not override it.

## 3. Credential separation

Two credentials have different purposes:

- Supabase login establishes the UI operator identity, additionally constrained by
  `MIGRATION_ADMIN_EMAILS`;
- `TRADINGWEB_IMPORT_TOKEN` is server-side and authorizes the call to TradingWEB.

The browser must not receive the TradingWEB import token.

## 4. Source identity and retries

Where Shopify exports provide stable source IDs, DataBridge preserves them in the import
contract so TradingWEB can resolve references and treat retries through its
`external_source_mappings` / import-session logic.

## 5. Verification

Current CI runs:

```bash
pnpm install --frozen-lockfile
pnpm validate
pnpm test
```

The current `package.json` still carries a wider frontend dependency surface inherited
from the earlier scaffold. That is dependency/cleanup debt, not evidence that DataBridge
owns those older commerce responsibilities. Dependencies should only be removed after
checking the active UI/build paths rather than to make the manifest look artificially
small.

## 6. Current non-goals

DataBridge is not:

- a general ETL framework;
- the target schema authority;
- a second order/payment system;
- an alternate TradingWEB database writer.

TradingWEB owns final admission and business-state mutation.
