/**
 * 迁移数据验证器
 *
 * 检查导入后的数据完整性：缺失字段、孤立记录、负库存等。
 */
import { getSupabaseClient } from '@/storage/database/supabase-client'

export interface ValidationCategory {
  status: 'pass' | 'warning' | 'fail'
  count: number
  details: string[]
}

export interface ValidationResult {
  overall: 'pass' | 'warning' | 'fail'
  details: Record<string, ValidationCategory>
  summary: {
    products: number
    variants: number
    customers: number
    orders: number
    order_items: number
    inventory: number
  }
}

/** 执行全量数据验证 */
export async function validateMigration(migrationId?: string): Promise<ValidationResult> {
  const client = getSupabaseClient()
  const details: Record<string, ValidationCategory> = {}

  // 1. 商品
  const { count: productCount } = await client
    .from('products').select('*', { count: 'exact', head: true }) as unknown as { count: number }
  const { data: productsNoCategory } = await client
    .from('products').select('id, title, category_id').is('category_id', null)
  const { data: productsNoSlug } = await client
    .from('products').select('id, title').is('slug', null)

  details['products'] = {
    status: (productsNoCategory && productsNoCategory.length > 0) ? 'warning' : 'pass',
    count: productCount || 0,
    details: [
      `总计 ${productCount || 0} 个商品`,
      productsNoCategory && productsNoCategory.length > 0 ? `${productsNoCategory.length} 个商品缺少分类` : '所有商品均有分类',
      productsNoSlug && productsNoSlug.length > 0 ? `${productsNoSlug.length} 个商品缺少slug` : '所有商品均有slug',
    ],
  }

  // 2. 变体
  const { count: variantCount } = await client
    .from('product_variants').select('*', { count: 'exact', head: true }) as unknown as { count: number }
  const { data: variantsNoProduct } = await client
    .from('product_variants').select('id, product_id').is('product_id', null)
  const { data: variantsNoPrice } = await client
    .from('product_variants').select('id, sku').is('price', null)

  details['variants'] = {
    status: (variantsNoProduct && variantsNoProduct.length > 0) ? 'fail'
      : (variantsNoPrice && variantsNoPrice.length > 0) ? 'warning' : 'pass',
    count: variantCount || 0,
    details: [
      `总计 ${variantCount || 0} 个商品变体`,
      variantsNoProduct && variantsNoProduct.length > 0 ? `${variantsNoProduct.length} 个变体缺少关联商品` : '所有变体均关联商品',
      variantsNoPrice && variantsNoPrice.length > 0 ? `${variantsNoPrice.length} 个变体缺少价格` : '所有变体均有价格',
    ],
  }

  // 3. 客户
  const { count: customerCount } = await client
    .from('customers').select('*', { count: 'exact', head: true }) as unknown as { count: number }
  const { data: customersNoEmail } = await client
    .from('customers').select('id, first_name, last_name').is('email', null)

  details['customers'] = {
    status: (customersNoEmail && customersNoEmail.length > 0) ? 'fail' : 'pass',
    count: customerCount || 0,
    details: [
      `总计 ${customerCount || 0} 个客户`,
      customersNoEmail && customersNoEmail.length > 0 ? `${customersNoEmail.length} 个客户缺少邮箱` : '所有客户均有邮箱',
    ],
  }

  // 4. 订单
  const { count: orderCount } = await client
    .from('orders').select('*', { count: 'exact', head: true }) as unknown as { count: number }
  const { count: orderItemCount } = await client
    .from('order_items').select('*', { count: 'exact', head: true }) as unknown as { count: number }
  const { data: ordersNoCustomer } = await client
    .from('orders').select('id, order_number').is('customer_id', null)

  details['orders'] = {
    status: (ordersNoCustomer && ordersNoCustomer.length > 0) ? 'warning' : 'pass',
    count: orderCount || 0,
    details: [
      `总计 ${orderCount || 0} 个订单`,
      `总计 ${orderItemCount || 0} 个订单明细`,
      ordersNoCustomer && ordersNoCustomer.length > 0 ? `${ordersNoCustomer.length} 个订单缺少关联客户` : '所有订单均关联客户',
    ],
  }

  // 5. 库存
  const { count: inventoryCount } = await client
    .from('inventory_records').select('*', { count: 'exact', head: true }) as unknown as { count: number }
  const { data: negativeInventory } = await client
    .from('inventory_records').select('id, variant_id, available').lt('available', 0)

  details['inventory'] = {
    status: (negativeInventory && negativeInventory.length > 0) ? 'warning' : 'pass',
    count: inventoryCount || 0,
    details: [
      `总计 ${inventoryCount || 0} 条库存记录`,
      negativeInventory && negativeInventory.length > 0 ? `${negativeInventory.length} 条库存为负数` : '所有库存均非负数',
    ],
  }

  // 6. 引用完整性
  const { data: orderItemsNoProduct } = await client
    .from('order_items').select('id, order_id').is('product_id', null)

  details['referential_integrity'] = {
    status: (orderItemsNoProduct && orderItemsNoProduct.length > 0) ? 'warning' : 'pass',
    count: orderItemCount || 0,
    details: [
      orderItemsNoProduct && orderItemsNoProduct.length > 0
        ? `${orderItemsNoProduct.length} 条订单明细缺少关联商品`
        : '所有订单明细均关联商品',
    ],
  }

  // 总体
  const hasFail = Object.values(details).some(r => r.status === 'fail')
  const hasWarning = Object.values(details).some(r => r.status === 'warning')
  const overallStatus = hasFail ? 'fail' : (hasWarning ? 'warning' : 'pass')

  // 保存到 migration_logs
  if (migrationId) {
    await client.from('migration_logs').update({
      validation_result: { overall: overallStatus, details },
    }).eq('id', migrationId)
  }

  return {
    overall: overallStatus,
    details,
    summary: {
      products: productCount || 0,
      variants: variantCount || 0,
      customers: customerCount || 0,
      orders: orderCount || 0,
      order_items: orderItemCount || 0,
      inventory: inventoryCount || 0,
    },
  }
}
