import {
  sanitizeEmail,
  sanitizeNullableText,
  sanitizeText,
} from "@/lib/security";
import {
  finishProgress,
  parseCsvRows,
  setRunningProgress,
  type ImportResult,
} from "./csv-importer";
import type { ImportAddress, ImportCustomerRecord } from "./contracts";
import { importEnvelope } from "./tradingweb-client";

function splitTags(value: string): string[] {
  return [...new Set(
    sanitizeText(value || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  )];
}

function mapAddress(
  row: Record<string, string>,
  firstName: string,
  lastName: string,
  phone: string,
): ImportAddress[] {
  const address1 = sanitizeNullableText(row["Address1"] || row["address1"]);
  const city = sanitizeNullableText(row["City"] || row["city"]);
  if (!address1 || !city) return [];

  return [{
    first_name: firstName || null,
    last_name: lastName || null,
    company: sanitizeNullableText(row["Company"] || row["company"]),
    address1,
    address2: sanitizeNullableText(row["Address2"] || row["address2"]),
    city,
    province: sanitizeNullableText(row["Province"] || row["province"]),
    province_code: sanitizeNullableText(
      row["Province Code"] || row["province_code"],
    ),
    country: sanitizeNullableText(row["Country"] || row["country"]),
    country_code: sanitizeNullableText(
      row["Country Code"] || row["country_code"],
    ),
    zip: sanitizeNullableText(row["Zip"] || row["zip"]),
    phone: phone || null,
    is_default: true,
  }];
}

function mapCustomer(
  row: Record<string, string>,
  index: number,
): ImportCustomerRecord {
  const email = sanitizeEmail(row["Email"] || row["email"]);
  if (!email) throw new Error(`Customer row ${index + 1} is missing email`);

  const firstName = sanitizeText(
    row["First Name"] || row["first_name"] || "",
  );
  const lastName = sanitizeText(
    row["Last Name"] || row["last_name"] || "",
  );
  const phone = sanitizeText(row["Phone"] || row["phone"] || "");
  const sourceId = sanitizeText(
    row["ID"] || row["shopify_id"] || email,
  );

  return {
    source_id: sourceId,
    email,
    first_name: firstName || null,
    last_name: lastName || null,
    phone: phone || null,
    accepts_marketing:
      row["Accepts Marketing"] === "yes"
      || row["Accepts Marketing"] === "true",
    tags: splitTags(row["Tags"] || row["tags"] || ""),
    addresses: mapAddress(row, firstName, lastName, phone),
    total_spent: row["Total Spent"] || "0",
    orders_count:
      Number.parseInt(row["Orders Count"] || "0", 10) || 0,
    note: sanitizeNullableText(row["Note"] || row["note"]),
  };
}

export async function importCustomers(file: File): Promise<ImportResult> {
  const rows = await parseCsvRows(file);
  const records = rows.map(mapCustomer);

  const { sessionId, result } = await importEnvelope("customers", records);
  setRunningProgress(sessionId, "customers", records.length);
  return finishProgress(sessionId, "customers", result);
}
