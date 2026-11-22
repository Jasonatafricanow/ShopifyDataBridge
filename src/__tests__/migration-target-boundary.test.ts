import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const RUNTIME_MIGRATION_FILES = [
  "src/services/migration/csv-importer.ts",
  "src/services/migration/product-importer.ts",
  "src/services/migration/customer-importer.ts",
  "src/services/migration/order-importer.ts",
  "src/services/migration/validator.ts",
  "src/services/admin/dashboard.ts",
  "src/app/api/admin/migration-logs/route.ts",
];

describe("migration target boundary", () => {
  it("does not write or read TradingWEB business data through Supabase", () => {
    for (const file of RUNTIME_MIGRATION_FILES) {
      const source = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(source, file).not.toContain("getSupabaseClient");
      expect(source, file).not.toContain(".from('products')");
      expect(source, file).not.toContain('.from("products")');
      expect(source, file).not.toContain("COZE_SUPABASE_SERVICE_ROLE_KEY");
    }
  });

  it("uses TradingWEB receiver configuration", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/services/migration/tradingweb-client.ts"),
      "utf8",
    );
    expect(source).toContain("TRADINGWEB_API_URL");
    expect(source).toContain("TRADINGWEB_IMPORT_TOKEN");
    expect(source).toContain("SHOPIFY_SOURCE_STORE");
    expect(source).toContain("Authorization");
  });
});
