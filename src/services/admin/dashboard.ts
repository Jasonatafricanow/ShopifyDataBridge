/**
 * 管理后台 - 仪表盘服务
 */
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function getDashboardStats() {
  const client = getSupabaseClient()

  const [products, customers, orders, orderItems, inventory, categories, variants] = await Promise.all([
    client.from('products').select('*', { count: 'exact', head: true }),
    client.from('customers').select('*', { count: 'exact', head: true }),
    client.from('orders').select('*', { count: 'exact', head: true }),
    client.from('order_items').select('*', { count: 'exact', head: true }),
    client.from('inventory_records').select('*', { count: 'exact', head: true }),
    client.from('categories').select('*', { count: 'exact', head: true }),
    client.from('product_variants').select('*', { count: 'exact', head: true }),
  ])

  for (const result of [products, customers, orders]) {
    if (result.error) throw new Error(result.error.message)
  }

  // 最近订单
  const { data: recentOrders, error: recentErr } = await client
    .from('orders')
    .select('id, order_number, email, total_price, financial_status, fulfillment_status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  if (recentErr) throw new Error(recentErr.message)

  // 收入统计
  const { data: revenueData, error: revErr } = await client
    .from('orders')
    .select('total_price, currency, created_at')
    .not('financial_status', 'eq', 'voided')
    .order('created_at', { ascending: false })
    .limit(100)
  if (revErr) throw new Error(revErr.message)

  const totalRevenue = revenueData?.reduce(
    (sum: number, o: { total_price: string | null }) => sum + parseFloat(o.total_price || '0'), 0
  ) || 0

  // 低库存
  const { data: lowStock, error: lowErr } = await client
    .from('inventory_records')
    .select('id, variant_id, product_id, available, on_hand, product_variants(sku, title, products(title))')
    .lt('available', 10)
    .order('available', { ascending: true })
    .limit(5)
  if (lowErr) throw new Error(lowErr.message)

  return {
    stats: {
      products: products.count || 0,
      variants: variants.count || 0,
      customers: customers.count || 0,
      orders: orders.count || 0,
      order_items: orderItems.count || 0,
      inventory: inventory.count || 0,
      categories: categories.count || 0,
      total_revenue: totalRevenue.toFixed(2),
    },
    recent_orders: recentOrders || [],
    low_stock: lowStock || [],
  }
}
