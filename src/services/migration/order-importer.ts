import {
  sanitizeEmail,
  sanitizeNullableText,
  sanitizeText,
} from "@/lib/security";
import {
  finishProgress,
  groupRows,
  parseCsvRows,
  setRunningProgress,
  type ImportResult,
} from "./csv-importer";
import type {
  ImportAddress,
  ImportOrderLineItem,
  ImportOrderRecord,
} from "./contracts";
import { importEnvelope } from "./tradingweb-client";

function orderGroupKey(row: Record<string, string>): string {
  return row["Order ID"] || row["Name"] || row["order_id"] || row["name"] || "";
}

function cleanAddress(
  row: Record<string, string>,
  prefix: "Shipping" | "Billing",
): ImportAddress | null {
  const address1 = sanitizeNullableText(
    row[`${prefix} Address1`]
      || row[`${prefix.toLowerCase()}_address1`],
  );
  const city = sanitizeNullableText(
    row[`${prefix} City`]
      || row[`${prefix.toLowerCase()}_city`],
  );
  if (!address1 && !city) return null;

  return {
    first_name: sanitizeNullableText(row[`${prefix} First Name`]),
    last_name: sanitizeNullableText(row[`${prefix} Last Name`]),
    company: sanitizeNullableText(row[`${prefix} Company`]),
    address1,
    address2: sanitizeNullableText(row[`${prefix} Address2`]),
    city,
    province: sanitizeNullableText(
      row[`${prefix} Province`]
        || row[`${prefix.toLowerCase()}_province`],
    ),
    province_code: sanitizeNullableText(row[`${prefix} Province Code`]),
    country: sanitizeNullableText(
      row[`${prefix} Country`]
        || row[`${prefix.toLowerCase()}_country`],
    ),
    country_code: sanitizeNullableText(row[`${prefix} Country Code`]),
    zip: sanitizeNullableText(
      row[`${prefix} Zip`]
        || row[`${prefix.toLowerCase()}_zip`],
    ),
    phone: sanitizeNullableText(row[`${prefix} Phone`]),
  };
}

function mapLineItem(
  row: Record<string, string>,
): ImportOrderLineItem {
  return {
    product_source_id: sanitizeNullableText(
      row["Product ID"] || row["Lineitem product id"],
    ),
    variant_source_id: sanitizeNullableText(
      row["Variant ID"] || row["Lineitem variant id"],
    ),
    title: sanitizeText(
      row["Lineitem name"] || row["Title"] || row["title"] || "",
    ),
    sku: sanitizeNullableText(
      row["Lineitem sku"] || row["SKU"] || row["sku"],
    ),
    quantity:
      Number.parseInt(row["Lineitem quantity"] || row["Quantity"] || "1", 10)
      || 1,
    price: row["Lineitem price"] || row["Price"] || row["price"] || "0",
  };
}

function splitCodes(value: string): string[] {
  return [...new Set(
    sanitizeText(value || "")
      .split(",")
      .map((code) => code.trim())
      .filter(Boolean),
  )];
}

function mapOrder(
  rows: Record<string, string>[],
  groupId: string,
): ImportOrderRecord {
  const first = rows[0];
  const sourceId = sanitizeText(
    first["Order ID"] || first["ID"] || groupId,
  );
  if (!sourceId) throw new Error("Order is missing a stable Shopify ID");

  const orderNumber = sanitizeText(
    first["Name"] || first["name"] || sourceId,
  );
  const lineItems = rows.map(mapLineItem);
  if (lineItems.some((line) => !line.title)) {
    throw new Error(`Order ${sourceId} has a line item without a title`);
  }

  return {
    source_id: sourceId,
    order_number: orderNumber,
    customer_source_id: sanitizeNullableText(first["Customer ID"]),
    email: sanitizeEmail(first["Email"] || first["email"]) || null,
    financial_status: sanitizeNullableText(
      first["Financial Status"] || first["financial_status"],
    ) || "pending",
    fulfillment_status: sanitizeNullableText(
      first["Fulfillment Status"] || first["fulfillment_status"],
    ) || "unfulfilled",
    currency: sanitizeNullableText(first["Currency"] || first["currency"])
      || "USD",
    total_price: first["Total"] || first["total_price"] || "0",
    subtotal_price:
      first["Subtotal"] || first["subtotal_price"] || null,
    shipping_price:
      first["Shipping"] || first["total_shipping"] || null,
    tax_price: first["Taxes"] || first["total_tax"] || null,
    discount_codes: splitCodes(
      first["Discount Code"] || first["Discount Codes"] || "",
    ),
    discount_amount:
      first["Discount Amount"] || first["total_discounts"] || null,
    billing_address: cleanAddress(first, "Billing"),
    shipping_address: cleanAddress(first, "Shipping"),
    line_items: lineItems,
    created_at:
      first["Processed At"]
      || first["Created at"]
      || first["created_at"]
      || null,
    note: sanitizeNullableText(first["Notes"] || first["note"]),
  };
}

export async function importOrders(file: File): Promise<ImportResult> {
  const rows = await parseCsvRows(file);
  const groups = groupRows(rows, orderGroupKey);
  const records = groups.map(([id, group]) => mapOrder(group, id));

  const { sessionId, result } = await importEnvelope("orders", records);
  setRunningProgress(sessionId, "orders", records.length);
  return finishProgress(sessionId, "orders", result);
}
