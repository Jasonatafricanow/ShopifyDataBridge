import {
  getImportSession,
  listImportSessions,
} from "@/services/migration/tradingweb-client";

function countMapping(
  mappings: Array<{ source_type: string; count: number }>,
  sourceType: string,
): number {
  return mappings
    .filter((entry) => entry.source_type === sourceType)
    .reduce((sum, entry) => sum + entry.count, 0);
}

export async function getDashboardStats() {
  const sessions = await listImportSessions();
  const latest = sessions.data[0]
    ? await getImportSession(sessions.data[0].session_id)
    : null;
  const reconciliation = latest?.reconciliation;
  const mappings = reconciliation?.mappings ?? [];

  return {
    stats: {
      products: countMapping(mappings, "product"),
      variants: countMapping(mappings, "variant"),
      customers: countMapping(mappings, "customer"),
      orders: reconciliation?.order_totals.count ?? 0,
      order_items: countMapping(mappings, "order_item"),
      inventory: countMapping(mappings, "variant"),
      categories: 0,
      total_revenue: String(
        reconciliation?.order_totals.total_amount ?? 0,
      ),
      import_sessions: sessions.total,
    },
    recent_orders: [],
    low_stock: [],
  };
}
