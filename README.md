# ShopifyDataBridge

[English](README.md) | [简体中文](README.zh-CN.md)

Convert Shopify product, customer and order CSV exports into TradingWEB import sessions. TradingWEB validates and commits the destination records.

## Import flow

CSV → parse and sanitize → map source IDs → submit import envelope → read the TradingWEB reconciliation result.

Supabase authenticates operators; `MIGRATION_ADMIN_EMAILS` authorizes them. Only the server uses `TRADINGWEB_IMPORT_TOKEN`.

```env
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=<public-anon-key>
MIGRATION_ADMIN_EMAILS=admin@example.com
TRADINGWEB_API_URL=https://store.example.com/api
TRADINGWEB_IMPORT_TOKEN=<server-side-operator-token>
SHOPIFY_SOURCE_STORE=example.myshopify.com
```

## Run and verify

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm validate
pnpm test
```

Importer regression tests call the production parser and mappers with synthetic CSV fixtures; only the receiver transport is mocked. Real, anonymized merchant exports and live receiver reconciliation remain separate acceptance work.

## Details and limitations

[Implementation](docs/IMPLEMENTATION.md) · [architecture correction history](docs/AUDIT-HISTORY.md) · [tests](src/__tests__)

The sender retains an in-process progress cache. Restart/resume, dry-run field differences and downloadable reconciliation reports remain follow-ups. `COZE_` names are retained for configuration compatibility.

## License

MIT — see [LICENSE](LICENSE).
