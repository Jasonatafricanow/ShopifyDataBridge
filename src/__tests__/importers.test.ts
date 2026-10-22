import { beforeEach, describe, expect, it, vi } from "vitest";
import { importProducts } from "@/services/migration/product-importer";
import { importCustomers } from "@/services/migration/customer-importer";
import { importOrders } from "@/services/migration/order-importer";
import { importEnvelope } from "@/services/migration/tradingweb-client";
import { parseCsvRows } from "@/services/migration/csv-importer";

vi.mock("@/services/migration/tradingweb-client", () => ({ importEnvelope: vi.fn() }));
const send = vi.mocked(importEnvelope);
const csv = (text: string) => new File([text], "synthetic-export.csv", { type: "text/csv" });
beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue({ sessionId: "test-session", result: {
    ok: true, job_type: "products", total: 1, success: 1, failed: 0, errors: [],
  } });
});

describe("production CSV importer contracts (synthetic Shopify-shaped exports)", () => {
  it("keeps multiple variants and multiline HTML, without inventing variants for image-only rows", async () => {
    await importProducts(csv('Handle,Title,Body (HTML),Variant ID,Variant SKU,Variant Price,Option1 Name,Option1 Value,Image Src\nshirt,Shirt,"<p>First line\nSecond line</p>",v1,SHIRT-S,12.50,Size,S,https://cdn.shopify.com/s/files/front.jpg\nshirt,,,v2,SHIRT-M,13.50,Size,M,\nshirt,,,,,,,,https://cdn.shopify.com/s/files/back.jpg'));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith("products", [expect.objectContaining({
      source_id: "shirt", description: "<p>First line\nSecond line</p>",
      variants: [
        expect.objectContaining({ source_id: "v1", sku: "SHIRT-S", price: "12.50", options: { Size: "S" }, is_default: true }),
        expect.objectContaining({ source_id: "v2", sku: "SHIRT-M", price: "13.50", options: { Size: "M" }, is_default: false }),
      ],
      images: [
        expect.objectContaining({ url: "https://cdn.shopify.com/s/files/front.jpg" }),
        expect.objectContaining({ url: "https://cdn.shopify.com/s/files/back.jpg" }),
      ],
    })]);
  });

  it("preserves an explicit free variant without a SKU", async () => {
    await importProducts(csv('Handle,Title,Variant Price\ngift,Gift,0'));
    expect(send.mock.calls[0][1][0]).toMatchObject({ variants: [
      { source_id: "gift:variant:0", price: "0", is_default: true },
    ] });
  });

  it("maps customer identity, address, marketing consent and deduplicated tags", async () => {
    await importCustomers(csv('ID,Email,First Name,Last Name,Address1,City,Country Code,Accepts Marketing,Tags\nc1,alex@example.com,Alex,Lee,10 Example St,Lisbon,PT,yes,"vip,vip,retail"'));
    expect(send).toHaveBeenCalledWith("customers", [expect.objectContaining({
      source_id: "c1", email: "alex@example.com", first_name: "Alex", last_name: "Lee",
      accepts_marketing: true, tags: ["vip", "retail"],
      addresses: [expect.objectContaining({ address1: "10 Example St", city: "Lisbon", country_code: "PT", is_default: true })],
    })]);
  });

  it("groups order lines and preserves partial-refund status and decimal totals", async () => {
    await importOrders(csv('Order ID,Name,Customer ID,Email,Financial Status,Total,Currency,Lineitem name,Lineitem sku,Lineitem quantity,Lineitem price\no1,#1001,c1,alex@example.com,partially_refunded,25.00,EUR,Shirt,SHIRT-S,1,12.50\no1,#1001,,,,,,Shirt,SHIRT-M,1,12.50'));
    expect(send).toHaveBeenCalledWith("orders", [expect.objectContaining({
      source_id: "o1", customer_source_id: "c1", financial_status: "partially_refunded",
      total_price: "25.00", currency: "EUR", line_items: [
        expect.objectContaining({ sku: "SHIRT-S", quantity: 1, price: "12.50" }),
        expect.objectContaining({ sku: "SHIRT-M", quantity: 1, price: "12.50" }),
      ],
    })]);
  });

  it("rejects a malformed CSV before submission", async () => {
    await expect(parseCsvRows(csv('Handle,Title\nshirt,"unterminated'))).rejects.toThrow("CSV parse failed");
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects a customer without an email before submission", async () => {
    await expect(importCustomers(csv('ID,Email\nc1,'))).rejects.toThrow("missing email");
    expect(send).not.toHaveBeenCalled();
  });
});
