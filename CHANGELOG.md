# Changelog

## Unreleased — portfolio audit

- Replace test-local CSV/authentication reimplementations with production importer and `requireUser` tests.
- Prevent image-only Shopify CSV rows from creating spurious zero-price variants; retain those rows in the image gallery. Reject products with no variant data.
- Cover multiline HTML, multiple variants, explicit zero-price variants, customer mapping, partial-refund status and malformed input using synthetic exports. This is not validation against real merchant exports or refund accounting.
- Remove unreferenced legacy PostgreSQL business schema and customer SQL migration. Supabase remains an authentication provider; TradingWEB owns destination writes.
- Replace a production domain in setup examples with an example domain and provide separate English/Chinese entry pages.

[Earlier receiver-boundary correction](docs/AUDIT-HISTORY.md).
