import { describe, expect, it } from "vitest";

import {
  escapeCsvFormula,
  isAllowedShopifyImageUrl,
  sanitizeHtml,
} from "@/lib/security";

describe("migration input security", () => {
  it("neutralizes spreadsheet formulas", () => {
    expect(escapeCsvFormula("=HYPERLINK(\"https://evil.test\")")).toMatch(/^'/);
  });

  it("removes executable HTML and event handlers", () => {
    const clean = sanitizeHtml('<script>alert(1)</script><p onclick="alert(2)">ok</p>');
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("onclick");
    expect(clean).toContain("<p>ok</p>");
  });

  it("only accepts HTTPS Shopify image hosts", () => {
    expect(isAllowedShopifyImageUrl("https://cdn.shopify.com/a.png")).toBe(true);
    expect(isAllowedShopifyImageUrl("http://cdn.shopify.com/a.png")).toBe(false);
    expect(isAllowedShopifyImageUrl("https://shopify.com.evil.test/a.png")).toBe(false);
  });
});
