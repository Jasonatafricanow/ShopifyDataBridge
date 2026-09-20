/**
 * 商品 CSV 导入逻辑
 *
 * Shopify 商品 CSV 每个变体占一行，按 Handle 分组后创建商品 + 变体 + 图片 + 库存。
 */
import { v4 as uuidv4 } from 'uuid'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { importGroupedCsv, type ImportResult } from './csv-importer'
import { generateSlug, ensureUniqueSlug } from '@/lib/migration-utils'
import { sanitizeHtml, sanitizeText, sanitizeNullableText, isAllowedShopifyImageUrl } from '@/lib/security'

interface ProductGroup {
  rows: Record<string, string>[]
  handle: string
}

function groupKey(row: Record<string, string>): string {
  return row['Handle'] || row['handle'] || ''
}

function mapGroup(rows: Record<string, string>[], handle: string): ProductGroup {
  return { rows, handle }
}

async function writeProductGroup(
  client: ReturnType<typeof getSupabaseClient>,
  group: ProductGroup,
) {
  const { rows, handle } = group
  const firstRow = rows[0]

  const title = sanitizeText(firstRow['Title'] || firstRow['title'] || handle)
  const slug = await ensureUniqueSlug('products', generateSlug(title))
  const productType = sanitizeText(firstRow['Type'] || firstRow['Product Category'] || firstRow['type'] || '')

  // 查找或创建分类
  let categoryId: string | null = null
  if (productType) {
    const { data: existingCat } = await client.from('categories').select('id').eq('name', productType).maybeSingle()
    if (existingCat) {
      categoryId = existingCat.id
    } else {
      const catSlug = await ensureUniqueSlug('categories', generateSlug(productType))
      const { data: newCat, error: catError } = await client.from('categories').insert({
        name: productType,
        slug: catSlug,
        shopify_id: sanitizeNullableText(firstRow['Custom collections']),
      }).select().single()
      if (!catError && newCat) categoryId = newCat.id
    }
  }

  // 使用 sanitizeHtml 清洗 Shopify HTML，防止存储型 XSS
  const cleanHtml = sanitizeHtml(firstRow['Body (HTML)'] || firstRow['body_html'] || '')

  // 创建商品
  const productId = uuidv4()
  const { error: prodError } = await client.from('products').insert({
    id: productId,
    title,
    slug,
    description: cleanHtml,
    body_html: cleanHtml,
    vendor: sanitizeText(firstRow['Vendor'] || firstRow['vendor'] || ''),
    product_type: productType,
    category_id: categoryId,
    status: (firstRow['Published'] === 'false' || firstRow['Status'] === 'draft') ? 'draft' : 'active',
    tags: sanitizeText(firstRow['Tags'] || firstRow['tags'] || ''),
    shopify_id: sanitizeText(firstRow['ID'] || ''),
    shopify_handle: sanitizeText(handle),
    published_at: firstRow['Published'] === 'true' ? new Date().toISOString() : null,
  })
  if (prodError) throw new Error(`创建商品失败: ${prodError.message}`)

  // 创建变体、库存、图片
  for (const row of rows) {
    const variantSku = sanitizeNullableText(row['Variant SKU'])
    const price = row['Variant Price'] || row['variant_price'] || '0'
    const comparePrice = row['Variant Compare At Price'] || row['variant_compare_at_price'] || null
    const inventory = parseInt(row['Variant Inventory Qty'] || row['variant_inventory_quantity'] || '0', 10) || 0

    const variantId = uuidv4()
    const { error: varError } = await client.from('product_variants').insert({
      id: variantId,
      product_id: productId,
      title: sanitizeText(row['Title'] || row['variant_title'] || title),
      sku: variantSku || null,
      barcode: sanitizeNullableText(row['Variant Barcode']),
      price,
      compare_at_price: comparePrice,
      weight: row['Variant Grams'] ? (parseFloat(row['Variant Grams']) / 1000).toString() : null,
      weight_unit: 'kg',
      inventory_quantity: inventory,
      option1: sanitizeNullableText(row['Option1 Value'] || row['option1']),
      option2: sanitizeNullableText(row['Option2 Value'] || row['option2']),
      option3: sanitizeNullableText(row['Option3 Value'] || row['option3']),
      position: parseInt(row['Variant Position'] || '1', 10) || 1,
      is_default: rows.length === 1,
      shopify_id: sanitizeText(row['Variant ID'] || ''),
    })
    if (varError) throw new Error(`创建变体失败: ${varError.message}`)

    // 库存
    await client.from('inventory_records').insert({
      id: uuidv4(),
      variant_id: variantId,
      product_id: productId,
      available: inventory,
      on_hand: inventory,
      committed: 0,
      damaged: 0,
      shopify_inventory_item_id: sanitizeNullableText(row['Variant Inventory Item ID']),
    })

    // 图片 — 必须通过 Shopify 域名白名单校验
    const imgSrc = row['Image Src'] || row['image_src'] || ''
    if (imgSrc && isAllowedShopifyImageUrl(imgSrc)) {
      await client.from('product_images').insert({
        id: uuidv4(),
        product_id: productId,
        variant_id: variantId,
        src: imgSrc,
        alt: sanitizeText(row['Image Alt Text'] || row['title'] || title),
        position: parseInt(row['Image Position'] || '1', 10) || 1,
        width: null,
        height: null,
        shopify_id: sanitizeNullableText(row['Image Id']),
      })
    }
  }
}

/** 从 CSV 导入商品 */
export async function importProducts(file: File): Promise<ImportResult> {
  return importGroupedCsv(
    file,
    'products',
    groupKey,
    mapGroup,
    writeProductGroup,
  )
}
