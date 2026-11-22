export type ImportJobType = "products" | "customers" | "orders";

export interface ImportEnvelope<T> {
  source: "shopify";
  source_store: string;
  schema_version: string;
  records: T[];
}

export interface ImportImage {
  url: string;
  alt?: string | null;
  position?: number | null;
}

export interface ImportProductVariant {
  source_id: string;
  sku?: string | null;
  barcode?: string | null;
  title?: string | null;
  options?: Record<string, string | null | undefined>;
  price: string;
  compare_at_price?: string | null;
  weight?: string | null;
  weight_unit?: string | null;
  image?: string | null;
  is_default?: boolean | null;
  inventory_quantity?: number | null;
}

export interface ImportProductRecord {
  source_id: string;
  title: string;
  description?: string | null;
  vendor?: string | null;
  collection?: string | null;
  barcode?: string | null;
  compare_at_price?: string | null;
  type?: string | null;
  category?: string | null;
  tags?: string[];
  status?: string;
  images?: ImportImage[];
  variants?: ImportProductVariant[];
  legacy_paths?: string[];
  seo?: {
    meta_title?: string | null;
    meta_description?: string | null;
  };
}

export interface ImportAddress {
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  province_code?: string | null;
  country?: string | null;
  country_code?: string | null;
  zip?: string | null;
  phone?: string | null;
  is_default?: boolean | null;
}

export interface ImportCustomerRecord {
  source_id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  accepts_marketing?: boolean | null;
  tags?: string[];
  addresses?: ImportAddress[];
  total_spent?: string | null;
  orders_count?: number | null;
  note?: string | null;
}

export interface ImportOrderLineItem {
  product_source_id?: string | null;
  variant_source_id?: string | null;
  title: string;
  sku?: string | null;
  quantity: number;
  price: string;
}

export interface ImportOrderRecord {
  source_id: string;
  order_number: string;
  customer_source_id?: string | null;
  email?: string | null;
  financial_status?: string | null;
  fulfillment_status?: string | null;
  currency?: string | null;
  total_price: string;
  subtotal_price?: string | null;
  shipping_price?: string | null;
  tax_price?: string | null;
  discount_codes?: string[];
  discount_amount?: string | null;
  billing_address?: ImportAddress | null;
  shipping_address?: ImportAddress | null;
  line_items: ImportOrderLineItem[];
  created_at?: string | null;
  note?: string | null;
}

export interface ImportRecordError {
  record_index: number;
  source_id?: string;
  code: string;
  field?: string;
  message: string;
}

export interface ImportBatchResult {
  ok: boolean;
  session_id?: string;
  job_type: ImportJobType;
  total: number;
  success: number;
  failed: number;
  errors: ImportRecordError[];
}

export interface ImportSessionDetail {
  session_id: string;
  source: string;
  source_store: string;
  status: string;
  jobs: Array<{
    job_type: string;
    status: string;
    total_rows: number;
    success_rows: number;
    failed_rows: number;
    errors?: ImportRecordError[];
  }>;
  reconciliation?: {
    completed: boolean;
    total_errors: number;
    order_totals: {
      count: number;
      total_amount: number;
      paid_amount: number;
      currency: string | null;
      currency_count: number;
    };
    mappings: Array<{
      source_type: string;
      local_table: string;
      count: number;
    }>;
    errors_by_code: Array<{ code: string; count: number }>;
  };
  started_at: string;
  finished_at?: string | null;
}
