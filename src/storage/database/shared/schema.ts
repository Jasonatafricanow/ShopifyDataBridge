import { pgTable, serial, varchar, text, numeric, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// ==================== 商品分类 ====================
export const categories = pgTable(
  "categories",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    parent_id: varchar("parent_id", { length: 36 }),
    shopify_id: varchar("shopify_id", { length: 50 }),
    sort_order: integer("sort_order").default(0).notNull(),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("categories_parent_id_idx").on(table.parent_id),
    index("categories_slug_idx").on(table.slug),
    index("categories_shopify_id_idx").on(table.shopify_id),
  ]
);

// ==================== 商品 ====================
export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull(),
    description: text("description"),
    body_html: text("body_html"),
    vendor: varchar("vendor", { length: 255 }),
    product_type: varchar("product_type", { length: 255 }),
    category_id: varchar("category_id", { length: 36 }).references(() => categories.id),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    tags: text("tags"),
    shopify_id: varchar("shopify_id", { length: 50 }),
    shopify_handle: varchar("shopify_handle", { length: 255 }),
    published_at: timestamp("published_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("products_category_id_idx").on(table.category_id),
    index("products_slug_idx").on(table.slug),
    index("products_status_idx").on(table.status),
    index("products_shopify_id_idx").on(table.shopify_id),
    index("products_vendor_idx").on(table.vendor),
    index("products_product_type_idx").on(table.product_type),
  ]
);

// ==================== 商品变体 ====================
export const productVariants = pgTable(
  "product_variants",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    product_id: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 500 }),
    sku: varchar("sku", { length: 100 }),
    barcode: varchar("barcode", { length: 100 }),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    compare_at_price: numeric("compare_at_price", { precision: 10, scale: 2 }),
    cost: numeric("cost", { precision: 10, scale: 2 }),
    weight: numeric("weight", { precision: 10, scale: 2 }),
    weight_unit: varchar("weight_unit", { length: 10 }).default("kg"),
    inventory_quantity: integer("inventory_quantity").default(0).notNull(),
    old_inventory_quantity: integer("old_inventory_quantity"),
    option1: varchar("option1", { length: 255 }),
    option2: varchar("option2", { length: 255 }),
    option3: varchar("option3", { length: 255 }),
    position: integer("position").default(1),
    is_default: boolean("is_default").default(false).notNull(),
    shopify_id: varchar("shopify_id", { length: 50 }),
    shopify_inventory_item_id: varchar("shopify_inventory_item_id", { length: 50 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("product_variants_product_id_idx").on(table.product_id),
    index("product_variants_sku_idx").on(table.sku),
    index("product_variants_barcode_idx").on(table.barcode),
    index("product_variants_shopify_id_idx").on(table.shopify_id),
  ]
);

// ==================== 商品图片 ====================
export const productImages = pgTable(
  "product_images",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    product_id: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
    variant_id: varchar("variant_id", { length: 36 }).references(() => productVariants.id),
    src: text("src").notNull(),
    alt: varchar("alt", { length: 500 }),
    position: integer("position").default(1),
    width: integer("width"),
    height: integer("height"),
    shopify_id: varchar("shopify_id", { length: 50 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("product_images_product_id_idx").on(table.product_id),
    index("product_images_variant_id_idx").on(table.variant_id),
  ]
);

// ==================== 客户 ====================
export const customers = pgTable(
  "customers",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    first_name: varchar("first_name", { length: 255 }),
    last_name: varchar("last_name", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    state: varchar("state", { length: 50 }).default("enabled"),
    tags: text("tags"),
    note: text("note"),
    accepts_marketing: boolean("accepts_marketing").default(false),
    tax_exempt: boolean("tax_exempt").default(false),
    total_spent: numeric("total_spent", { precision: 12, scale: 2 }).default("0"),
    orders_count: integer("orders_count").default(0),
    shopify_id: varchar("shopify_id", { length: 50 }),
    metadata: jsonb("metadata"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("customers_shopify_id_idx").on(table.shopify_id),
    index("customers_state_idx").on(table.state),
  ]
);

// ==================== 客户地址 ====================
export const customerAddresses = pgTable(
  "customer_addresses",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    customer_id: varchar("customer_id", { length: 36 }).notNull().references(() => customers.id, { onDelete: "cascade" }),
    first_name: varchar("first_name", { length: 255 }),
    last_name: varchar("last_name", { length: 255 }),
    company: varchar("company", { length: 255 }),
    address1: varchar("address1", { length: 500 }),
    address2: varchar("address2", { length: 500 }),
    city: varchar("city", { length: 255 }),
    province: varchar("province", { length: 255 }),
    province_code: varchar("province_code", { length: 10 }),
    country: varchar("country", { length: 255 }),
    country_code: varchar("country_code", { length: 10 }),
    zip: varchar("zip", { length: 20 }),
    phone: varchar("phone", { length: 50 }),
    is_default: boolean("is_default").default(false),
    shopify_id: varchar("shopify_id", { length: 50 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("customer_addresses_customer_id_idx").on(table.customer_id),
  ]
);

// ==================== 订单 ====================
export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    order_number: varchar("order_number", { length: 50 }),
    email: varchar("email", { length: 255 }),
    customer_id: varchar("customer_id", { length: 36 }).references(() => customers.id),
    financial_status: varchar("financial_status", { length: 50 }),
    fulfillment_status: varchar("fulfillment_status", { length: 50 }),
    subtotal_price: numeric("subtotal_price", { precision: 12, scale: 2 }),
    total_discounts: numeric("total_discounts", { precision: 12, scale: 2 }),
    total_price: numeric("total_price", { precision: 12, scale: 2 }),
    total_tax: numeric("total_tax", { precision: 12, scale: 2 }),
    total_shipping: numeric("total_shipping", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 10 }).default("USD"),
    taxes_included: boolean("taxes_included").default(false),
    cancel_reason: varchar("cancel_reason", { length: 255 }),
    note: text("note"),
    tags: text("tags"),
    shipping_address: jsonb("shipping_address"),
    billing_address: jsonb("billing_address"),
    shopify_id: varchar("shopify_id", { length: 50 }),
    processed_at: timestamp("processed_at", { withTimezone: true }),
    cancelled_at: timestamp("cancelled_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("orders_customer_id_idx").on(table.customer_id),
    index("orders_order_number_idx").on(table.order_number),
    index("orders_financial_status_idx").on(table.financial_status),
    index("orders_fulfillment_status_idx").on(table.fulfillment_status),
    index("orders_shopify_id_idx").on(table.shopify_id),
    index("orders_created_at_idx").on(table.created_at),
    index("orders_email_idx").on(table.email),
  ]
);

// ==================== 订单明细 ====================
export const orderItems = pgTable(
  "order_items",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    order_id: varchar("order_id", { length: 36 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 36 }).references(() => products.id),
    variant_id: varchar("variant_id", { length: 36 }).references(() => productVariants.id),
    title: varchar("title", { length: 500 }),
    variant_title: varchar("variant_title", { length: 500 }),
    sku: varchar("sku", { length: 100 }),
    vendor: varchar("vendor", { length: 255 }),
    quantity: integer("quantity").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    total_discount: numeric("total_discount", { precision: 10, scale: 2 }),
    requires_shipping: boolean("requires_shipping").default(true),
    taxable: boolean("taxable").default(true),
    shopify_id: varchar("shopify_id", { length: 50 }),
    shopify_product_id: varchar("shopify_product_id", { length: 50 }),
    shopify_variant_id: varchar("shopify_variant_id", { length: 50 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.order_id),
    index("order_items_product_id_idx").on(table.product_id),
    index("order_items_variant_id_idx").on(table.variant_id),
  ]
);

// ==================== 库存记录 ====================
export const inventoryRecords = pgTable(
  "inventory_records",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    variant_id: varchar("variant_id", { length: 36 }).notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
    available: integer("available").default(0).notNull(),
    on_hand: integer("on_hand").default(0).notNull(),
    committed: integer("committed").default(0).notNull(),
    damaged: integer("damaged").default(0).notNull(),
    location: varchar("location", { length: 255 }),
    shopify_inventory_item_id: varchar("shopify_inventory_item_id", { length: 50 }),
    last_restocked_at: timestamp("last_restocked_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("inventory_records_variant_id_idx").on(table.variant_id),
    index("inventory_records_product_id_idx").on(table.product_id),
  ]
);

// ==================== 优惠码 ====================
export const discountCodes = pgTable(
  "discount_codes",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code", { length: 100 }).notNull(),
    description: text("description"),
    discount_type: varchar("discount_type", { length: 30 }).notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    minimum_order_amount: numeric("minimum_order_amount", { precision: 10, scale: 2 }),
    usage_count: integer("usage_count").default(0),
    usage_limit: integer("usage_limit"),
    starts_at: timestamp("starts_at", { withTimezone: true }),
    ends_at: timestamp("ends_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    shopify_id: varchar("shopify_id", { length: 50 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("discount_codes_code_idx").on(table.code),
    index("discount_codes_status_idx").on(table.status),
  ]
);

// ==================== 数据迁移日志 ====================
export const migrationLogs = pgTable(
  "migration_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    migration_type: varchar("migration_type", { length: 50 }).notNull(),
    status: varchar("status", { length: 30 }).notNull(),
    source: varchar("source", { length: 100 }).default("shopify"),
    records_total: integer("records_total").default(0),
    records_success: integer("records_success").default(0),
    records_failed: integer("records_failed").default(0),
    error_details: jsonb("error_details"),
    validation_result: jsonb("validation_result"),
    started_at: timestamp("started_at", { withTimezone: true }),
    completed_at: timestamp("completed_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("migration_logs_type_idx").on(table.migration_type),
    index("migration_logs_status_idx").on(table.status),
    index("migration_logs_created_at_idx").on(table.created_at),
  ]
);
