/**
 * 客户 CSV 导入逻辑
 */
import { v4 as uuidv4 } from 'uuid'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { importCsv, type ImportResult } from './csv-importer'
import { sanitizeEmail, sanitizeText } from '@/lib/security'

interface CustomerRow {
  email: string
  firstName: string
  lastName: string
  phone: string
  state: string
  tags: string
  note: string
  acceptsMarketing: boolean
  taxExempt: boolean
  totalSpent: string
  ordersCount: number
  shopifyId: string
  // 地址
  address1: string
  address2: string
  company: string
  city: string
  province: string
  provinceCode: string
  country: string
  countryCode: string
  zip: string
  addressShopifyId: string
}

function mapRow(row: Record<string, string>): CustomerRow {
  return {
    email: sanitizeEmail(row['Email'] || row['email']),
    firstName: sanitizeText(row['First Name'] || row['first_name'] || ''),
    lastName: sanitizeText(row['Last Name'] || row['last_name'] || ''),
    phone: sanitizeText(row['Phone'] || row['phone'] || ''),
    state: sanitizeText(row['State'] || row['state'] || 'enabled'),
    tags: sanitizeText(row['Tags'] || row['tags'] || ''),
    note: sanitizeText(row['Note'] || row['note'] || ''),
    acceptsMarketing: row['Accepts Marketing'] === 'yes' || row['Accepts Marketing'] === 'true',
    taxExempt: row['Tax Exempt'] === 'yes' || row['Tax Exempt'] === 'true',
    totalSpent: row['Total Spent'] || '0',
    ordersCount: parseInt(row['Orders Count'] || '0', 10) || 0,
    shopifyId: sanitizeText(row['ID'] || row['shopify_id'] || ''),
    address1: sanitizeText(row['Address1'] || row['address1'] || ''),
    address2: sanitizeText(row['Address2'] || row['address2'] || ''),
    company: sanitizeText(row['Company'] || row['company'] || ''),
    city: sanitizeText(row['City'] || row['city'] || ''),
    province: sanitizeText(row['Province'] || row['province'] || ''),
    provinceCode: sanitizeText(row['Province Code'] || row['province_code'] || ''),
    country: sanitizeText(row['Country'] || row['country'] || ''),
    countryCode: sanitizeText(row['Country Code'] || row['country_code'] || ''),
    zip: sanitizeText(row['Zip'] || row['zip'] || ''),
    addressShopifyId: sanitizeText(row['Address ID'] || ''),
  }
}

async function writeCustomer(
  client: ReturnType<typeof getSupabaseClient>,
  mapped: CustomerRow,
) {
  const { email, firstName, lastName, phone, state, tags, note,
          acceptsMarketing, taxExempt, totalSpent, ordersCount, shopifyId,
          address1, address2, company, city, province, provinceCode,
          country, countryCode, zip, addressShopifyId } = mapped

  if (!email) {
    throw new Error('缺少邮箱地址')
  }

  // 检查重复
  const { data: existing } = await client.from('customers').select('id').eq('email', email).maybeSingle()

  if (existing) {
    // 更新已有客户
    await client.from('customers').update({
      first_name: firstName,
      last_name: lastName,
      phone,
      state,
      tags,
      note,
      accepts_marketing: acceptsMarketing,
      tax_exempt: taxExempt,
      total_spent: totalSpent,
      orders_count: ordersCount,
      shopify_id: shopifyId,
      updated_at: new Date().toISOString(),
    }).eq('id', existing.id)

    // 创建地址
    if (address1) {
      await client.from('customer_addresses').insert({
        id: uuidv4(),
        customer_id: existing.id,
        first_name: firstName,
        last_name: lastName,
        company,
        address1,
        address2,
        city,
        province,
        province_code: provinceCode,
        country,
        country_code: countryCode,
        zip,
        phone,
        is_default: true,
        shopify_id: addressShopifyId,
      })
    }
    return
  }

  // 创建新客户
  const customerId = uuidv4()
  const { error: custError } = await client.from('customers').insert({
    id: customerId,
    email,
    first_name: firstName,
    last_name: lastName,
    phone,
    state,
    tags,
    note,
    accepts_marketing: acceptsMarketing,
    tax_exempt: taxExempt,
    total_spent: totalSpent,
    orders_count: ordersCount,
    shopify_id: shopifyId,
  })
  if (custError) throw new Error(`创建客户失败: ${custError.message}`)

  if (address1) {
    await client.from('customer_addresses').insert({
      id: uuidv4(),
      customer_id: customerId,
      first_name: firstName,
      last_name: lastName,
      company,
      address1,
      address2,
      city,
      province,
      province_code: provinceCode,
      country,
      country_code: countryCode,
      zip,
      phone,
      is_default: true,
      shopify_id: addressShopifyId,
    })
  }
}

/** 从 CSV 导入客户 */
export async function importCustomers(file: File): Promise<ImportResult> {
  return importCsv(file, 'customers', mapRow, writeCustomer)
}
