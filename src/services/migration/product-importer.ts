import {
  isAllowedShopifyImageUrl,
  sanitizeHtml,
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
  ImportImage,
  ImportProductRecord,
  ImportProductVariant,
} from "./contracts";
import { importEnvelope } from "./tradingweb-client";

function productGroupKey(row: Record<string, string>): string {
  return row["Handle"] || row["handle"] || row["ID"] || "";
}

function splitTags(value: string): string[] {
  return [...new Set(
    sanitizeText(value || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  )];
}

function stableProductSourceId(
  first: Record<string, string>,
  handle: string,
): string {
  return sanitizeText(first["ID"] || first["Product ID"] || handle);
}

function variantSourceId(
  row: Record<string, string>,
  productSourceId: string,
  index: number,
): string {
  return sanitizeText(
    row["Variant ID"]
      || row["variant_id"]
      || row["Variant SKU"]
      || `${productSourceId}:variant:${index}`,
  );
}

function mapVariant(
  row: Record<string, string>,
  productSourceId: string,
  index: number,
  count: number,
): ImportProductVariant {
  const options: Record<string, string> = {};
  for (const n of [1, 2, 3]) {
    const name = sanitizeText(row[`Option${n} Name`] || "");
    const value = sanitizeText(row[`Option${n} Value`] || "");
    if (name && value) options[name] = value;
  }

  const image = row["Variant Image"] || row["Image Src"] || "";
  return {
    source_id: variantSourceId(row, productSourceId, index),
    sku: sanitizeNullableText(row["Variant SKU"]),
    barcode: sanitizeNullableText(row["Variant Barcode"]),
    title: sanitizeNullableText(
      row["Variant Title"] || row["Title"] || undefined,
    ),
    options,
    price: row["Variant Price"] || "0",
    compare_at_price: sanitizeNullableText(row["Variant Compare At Price"]),
    weight: row["Variant Grams"]
      ? (Number(row["Variant Grams"]) / 1000).toString()
      : null,
    weight_unit: "kg",
    image: image && isAllowedShopifyImageUrl(image) ? image : null,
    is_default: count === 1 || index === 0,
    inventory_quantity:
      Number.parseInt(
        row["Variant Inventory Qty"]
          || row["variant_inventory_quantity"]
          || "0",
        10,
      ) || 0,
  };
}

function mapImages(rows: Record<string, string>[]): ImportImage[] {
  const seen = new Set<string>();
  const images: ImportImage[] = [];
  for (const row of rows) {
    const url = row["Image Src"] || row["image_src"] || "";
    if (!url || seen.has(url) || !isAllowedShopifyImageUrl(url)) continue;
    seen.add(url);
    images.push({
      url,
      alt: sanitizeNullableText(
        row["Image Alt Text"] || row["Title"] || undefined,
      ),
      position:
        Number.parseInt(row["Image Position"] || "", 10)
        || images.length + 1,
    });
  }
  return images;
}

function mapProduct(
  rows: Record<string, string>[],
  handle: string,
): ImportProductRecord {
  const first = rows[0];
  const sourceId = stableProductSourceId(first, handle);
  if (!sourceId) {
    throw new Error(`Product ${handle || "<unknown>"} has no stable source ID`);
  }

  const title = sanitizeText(first["Title"] || first["title"] || handle);
  if (!title) throw new Error(`Product ${sourceId} has no title`);

  const category = sanitizeNullableText(
    first["Product Category"] || first["Type"] || first["type"],
  );

  return {
    source_id: sourceId,
    title,
    description: sanitizeHtml(
      first["Body (HTML)"] || first["body_html"] || "",
    ),
    vendor: sanitizeNullableText(first["Vendor"] || first["vendor"]),
    collection: sanitizeNullableText(first["Custom collections"]),
    barcode: sanitizeNullableText(first["Barcode"]),
    compare_at_price: sanitizeNullableText(first["Variant Compare At Price"]),
    // Shopify's "Type" is a merchandising category, not TradingWEB's
    // physical/virtual/service product-kind field.
    type: "physical",
    category,
    tags: splitTags(first["Tags"] || first["tags"] || ""),
    status:
      first["Published"] === "false" || first["Status"] === "draft"
        ? "draft"
        : "active",
    images: mapImages(rows),
    variants: rows.map((row, index) =>
      mapVariant(row, sourceId, index, rows.length)
    ),
    legacy_paths: handle ? [`/products/${sanitizeText(handle)}`] : [],
    seo: {
      meta_title: sanitizeNullableText(first["SEO Title"]),
      meta_description: sanitizeNullableText(first["SEO Description"]),
    },
  };
}

export async function importProducts(file: File): Promise<ImportResult> {
  const rows = await parseCsvRows(file);
  const groups = groupRows(rows, productGroupKey);
  const records = groups.map(([handle, group]) => mapProduct(group, handle));

  const { sessionId, result } = await importEnvelope("products", records);
  setRunningProgress(sessionId, "products", records.length);
  return finishProgress(sessionId, "products", result);
}
