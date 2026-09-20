/**
 * 订单 CSV 导入逻辑
 *
 * Shopify 订单 CSV 每个订单项占一行，需按 Order ID 分组后再处理。
 */
import { v4 as uuidv4 } from 'uuid'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { importGroupedCsv, type ImportResult } from './csv-importer'
import { sanitizeEmail, sanitizeNullableText, sanitizeText } from '@/lib/security'

interface OrderGroup {
  rows: Record<string, string>[]
  orderId: string
}

function groupKey(row: Record<string, string>): string {
  return row['Order ID'] || row['Name'] || row['order_id'] || row['name'] || ''
}

function mapGroup(rows: Record<string, string>[], orderId: string): OrderGroup {
  return { rows, orderId }
}

async function writeOrderGroup(
  client: ReturnType<typeof getSupabaseClient>,
  group: OrderGroup,
) {
  const { rows, orderId } = group
  const firstRow = rows[0]

  const orderNumber = sanitizeText(firstRow['Name'] || firstRow['name'] || orderId)
  const email = sanitizeEmail(firstRow['Email'] || firstRow['email'])

  // 建立 shopify_id -> 本地 id 映射（查找一次，复用多次）
  const customerShopifyMap = new Map<string, string>()
  const { data: customerData } = await client.from('customers').select('id, shopify_id').not('shopify_id', 'is', null)
  if (customerData) {
    for (const c of customerData) {
      if (c.shopify_id) customerShopifyMap.set(c.shopify_id, c.id)
    }
  }

  const productShopifyMap = new Map<string, string>()
  const { data: productData } = await client.from('products').select('id, shopify_id').not('shopify_id', 'is', null)
  if (productData) {
    for (const p of productData) {
      if (p.shopify_id) productShopifyMap.set(p.shopify_id, p.id)
    }
  }

  const variantShopifyMap = new Map<string, string>()
  const { data: variantData } = await client.from('product_variants').select('id, shopify_id').not('shopify_id', 'is', null)
  if (variantData) {
    for (const v of variantData) {
      if (v.shopify_id) variantShopifyMap.set(v.shopify_id, v.id)
    }
  }

  // 查找客户
  let customerId: string | null = null
  const shopifyCustomerId = sanitizeText(firstRow['Customer ID'] || '')
  if (shopifyCustomerId && customerShopifyMap.has(shopifyCustomerId)) {
    customerId = customerShopifyMap.get(shopifyCustomerId)!
  } else if (email) {
    const { data: existingCustomer } = await client.from('customers').select('id').eq('email', email).maybeSingle()
    if (existingCustomer) customerId = existingCustomer.id
  }

  // 地址
  const shippingAddress = {
    first_name: sanitizeText(firstRow['Shipping First Name'] || firstRow['shipping_first_name'] || ''),
    last_name: sanitizeText(firstRow['Shipping Last Name'] || firstRow['shipping_last_name'] || ''),
    company: sanitizeText(firstRow['Shipping Company'] || ''),
    address1: sanitizeText(firstRow['Shipping Address1'] || firstRow['shipping_address1'] || ''),
    address2: sanitizeText(firstRow['Shipping Address2'] || firstRow['shipping_address2'] || ''),
    city: sanitizeText(firstRow['Shipping City'] || firstRow['shipping_city'] || ''),
    province: sanitizeText(firstRow['Shipping Province'] || firstRow['shipping_province'] || ''),
    province_code: sanitizeText(firstRow['Shipping Province Code'] || ''),
    country: sanitizeText(firstRow['Shipping Country'] || firstRow['shipping_country'] || ''),
    country_code: sanitizeText(firstRow['Shipping Country Code'] || ''),
    zip: sanitizeText(firstRow['Shipping Zip'] || firstRow['shipping_zip'] || ''),
    phone: sanitizeText(firstRow['Shipping Phone'] || ''),
  }

  const billingAddress = {
    first_name: sanitizeText(firstRow['Billing First Name'] || firstRow['billing_first_name'] || ''),
    last_name: sanitizeText(firstRow['Billing Last Name'] || firstRow['billing_last_name'] || ''),
    company: sanitizeText(firstRow['Billing Company'] || ''),
    address1: sanitizeText(firstRow['Billing Address1'] || firstRow['billing_address1'] || ''),
    address2: sanitizeText(firstRow['Billing Address2'] || firstRow['billing_address2'] || ''),
    city: sanitizeText(firstRow['Billing City'] || firstRow['billing_city'] || ''),
    province: sanitizeText(firstRow['Billing Province'] || firstRow['billing_province'] || ''),
    province_code: sanitizeText(firstRow['Billing Province Code'] || ''),
    country: sanitizeText(firstRow['Billing Country'] || firstRow['billing_country'] || ''),
    country_code: sanitizeText(firstRow['Billing Country Code'] || ''),
    zip: sanitizeText(firstRow['Billing Zip'] || firstRow['billing_zip'] || ''),
    phone: sanitizeText(firstRow['Billing Phone'] || ''),
  }

  // 创建订单
  const newOrderId = uuidv4()
  const { error: orderError } = await client.from('orders').insert({
    id: newOrderId,
    order_number: orderNumber,
    email,
    customer_id: customerId,
    financial_status: sanitizeText(firstRow['Financial Status'] || firstRow['financial_status'] || 'pending'),
    fulfillment_status: sanitizeText(firstRow['Fulfillment Status'] || firstRow['fulfillment_status'] || 'unfulfilled'),
    subtotal_price: firstRow['Subtotal'] || firstRow['subtotal_price'] || '0',
    total_discounts: firstRow['Discount Amount'] || firstRow['total_discounts'] || '0',
    total_price: firstRow['Total'] || firstRow['total_price'] || '0',
    total_tax: firstRow['Taxes'] || firstRow['total_tax'] || '0',
    total_shipping: firstRow['Shipping'] || firstRow['total_shipping'] || '0',
    currency: sanitizeText(firstRow['Currency'] || firstRow['currency'] || 'USD'),
    taxes_included: firstRow['Taxes Included'] === 'true' || firstRow['Taxes Included'] === 'Yes',
    cancel_reason: sanitizeNullableText(firstRow['Cancel Reason']),
    note: sanitizeText(firstRow['Notes'] || firstRow['note'] || ''),
    tags: sanitizeText(firstRow['Tags'] || firstRow['tags'] || ''),
    shipping_address: shippingAddress,
    billing_address: billingAddress,
    shopify_id: sanitizeText(orderId),
    processed_at: firstRow['Processed At'] || firstRow['created_at'] || null,
    cancelled_at: firstRow['Cancelled At'] || null,
  })
  if (orderError) throw new Error(`创建订单失败: ${orderError.message}`)

  // 创建订单明细
  for (const row of rows) {
    const shopifyProductId = sanitizeText(row['Product ID'] || row['Lineitem product id'] || '')
    const shopifyVariantId = sanitizeText(row['Variant ID'] || row['Lineitem variant id'] || '')
    const productId = productShopifyMap.get(shopifyProductId) || null
    const variantId = variantShopifyMap.get(shopifyVariantId) || null

    await client.from('order_items').insert({
      id: uuidv4(),
      order_id: newOrderId,
      product_id: productId,
      variant_id: variantId,
      title: sanitizeText(row['Lineitem name'] || row['Title'] || row['title'] || ''),
      variant_title: sanitizeText(row['Lineitem variant'] || row['Variant Title'] || ''),
      sku: sanitizeNullableText(row['Lineitem sku'] || row['SKU'] || row['sku']),
      vendor: sanitizeText(row['Lineitem vendor'] || row['Vendor'] || row['vendor'] || ''),
      quantity: parseInt(row['Lineitem quantity'] || row['Quantity'] || '1', 10) || 1,
      price: row['Lineitem price'] || row['Price'] || row['price'] || '0',
      total_discount: row['Lineitem discount'] || '0',
      requires_shipping: row['Requires Shipping'] !== 'false',
      taxable: row['Taxable'] !== 'false',
      shopify_id: sanitizeText(row['Lineitem id'] || ''),
      shopify_product_id: shopifyProductId,
      shopify_variant_id: shopifyVariantId,
    })
  }
}

/** 从 CSV 导入订单 */
export async function importOrders(file: File): Promise<ImportResult> {
  return importGroupedCsv(
    file,
    'orders',
    groupKey,
    mapGroup,
    writeOrderGroup,
  )
}
