# ShopifyDataBridge

ShopifyDataBridge is a migration tool for importing Shopify CSV exports into TradingWEB.

It keeps Shopify-specific parsing/cleanup outside the main application and validates related datasets before sending them to the TradingWEB import API.

## Import flow

```text
Shopify CSV files
      |
      v
parse
      |
      v
sanitize
      |
      v
validate fields + references
      |
      v
map to TradingWEB format
      |
      v
batch import
      |
      v
progress / migration log
```

## Current implementation

The repository handles:

- products and variants;
- customers;
- historical orders;
- inventory/status fields;
- SKU/identifier checks;
- cross-file references;
- CSV formula-injection defenses;
- HTML sanitization;
- remote asset-origin constraints;
- batch progress;
- migration logs;
- TradingWEB import calls.

## Validation

A syntactically valid CSV row can still be unusable.

The validator checks related datasets together so, for example, an order referencing a missing product or an inventory record with inconsistent identifiers can be rejected before upload.

Source text is also sanitized before it reaches the target application.

## Relationship to TradingWEB

ShopifyDataBridge understands Shopify export formats.

[TradingWEB](https://github.com/Jasonatafricanow/TradingWEB) owns the target product/order/customer model and exposes the import receiver.

Keeping those two pieces separate avoids putting one-off Shopify CSV parsing into ordinary storefront/API code.

## Verification

```bash
pnpm install
pnpm validate
pnpm test
```

The project uses TypeScript strict checking, linting, and Vitest.

## Run

```bash
pnpm install
pnpm dev
```

## Scope

This is a Shopify-to-TradingWEB migration tool, not a general ETL platform. It does not claim lossless support for every third-party Shopify app field or historical customization.

## Stack

Next.js · React · TypeScript · PapaParse · Zod · Vitest

## Repository history

The public repository is a cleaned publication of an earlier migration project. The public commit history begins at that publication baseline.
