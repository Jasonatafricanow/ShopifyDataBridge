# ShopifyDataBridge

**A validation and migration boundary between Shopify exports and TradingWEB.**

ShopifyDataBridge exists because historical data import is not the same workload as ordinary application traffic. CSV exports carry source-specific structure, partial relationships, unsafe text fields, inconsistent identifiers, and batch-level failure semantics.

The project turns migration into an explicit admission pipeline instead of a collection of one-off database scripts.

## Portfolio role

```text
Shopify exports
      |
      v
ShopifyDataBridge
 parse / sanitize / validate / map
      |
      v
TradingWEB import receiver
      |
      v
TradingWEB domain + database
```

It is intentionally separate from [TradingWEB](https://github.com/Jasonatafricanow/TradingWEB): the bridge understands source-format problems; TradingWEB remains responsible for target business semantics.

## The problem

A direct CSV-to-database import can create failures that are difficult to repair later:

- duplicate or missing SKUs;
- invalid emails and customer identities;
- orders that reference missing products;
- negative or inconsistent inventory;
- source HTML that introduces unsafe markup;
- spreadsheet-formula payloads;
- partial batches where some objects were written and others were not.

Migration therefore needs a gate before target-state mutation.

## How the design evolved

### 1. Migration was separated from the main product path

Normal storefront requests and historical bulk imports have different trust, volume, and validation characteristics. Keeping source-specific parsing outside TradingWEB prevents import mechanics from leaking into the core product.

### 2. Parsing was not enough

A syntactically valid CSV can still be semantically unusable. The pipeline therefore validates entities and cross-entity references before import.

### 3. Source data is treated as untrusted input

CSV cells, rich text, and remote asset URLs are sanitized or constrained before they are admitted downstream.

### 4. Progress and audit became first-class

A migration is an operational process, not one HTTP request. Batch progress and migration logs make failures inspectable instead of forcing operators to infer state from the database.

## Key design decisions

### Validate before admission

Parsing creates candidates. Validation determines whether they can enter the target system.

### Referential integrity spans files

Products, variants, customers, orders, and inventory are checked as a connected dataset rather than independent CSV rows.

### Sanitize at the boundary

Formula prefixes, unsafe HTML, and asset origins are handled before target persistence.

### Source and target responsibilities remain separate

The bridge knows Shopify export semantics. TradingWEB knows target domain semantics.

## Architecture

```text
Shopify CSV files
      |
      v
Parser
      |
      v
Sanitization
      |
      v
Validation
 fields / uniqueness / references / inventory
      |
      v
Mapping + batch import
      |
      v
TradingWEB receiver
      |
      v
Progress + audit record
```

## Current implementation

The repository includes product / variant, customer, and historical-order parsing; field and status validation; uniqueness and inventory checks; cross-entity reference checks; CSV formula-injection defenses; HTML sanitization; asset-origin constraints; progress and migration-log surfaces; and a TradingWEB import adapter.

## Verification

```bash
pnpm install
pnpm validate
pnpm test
```

TypeScript strict checking, linting, and Vitest are part of the repository toolchain.

## Boundaries and non-claims

ShopifyDataBridge is not a universal ETL platform and does not claim lossless compatibility with every historical Shopify customization or third-party app field.

Its scope is intentionally narrower: make a known Shopify-to-TradingWEB migration inspectable, validated, and repeatable.

## Stack

Next.js · React · TypeScript · PapaParse · Zod · Vitest

## Run

```bash
pnpm install
pnpm dev
```

## Repository history

This public repository is a cleaned publication of an earlier migration project. The public Git history begins at the publication baseline and should not be read as the original development timeline.

## Engineering philosophy

Migration is an authority boundary.

Source data should not become target truth merely because it can be parsed. It has to survive sanitization, semantic validation, and referential checks first.
