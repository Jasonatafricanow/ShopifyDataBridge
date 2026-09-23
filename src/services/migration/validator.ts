import { getImportSession } from "./tradingweb-client";

export interface ValidationCategory {
  status: "pass" | "warning" | "fail";
  count: number;
  details: string[];
}

export interface ValidationResult {
  overall: "pass" | "warning" | "fail";
  details: Record<string, ValidationCategory>;
  summary: {
    products: number;
    variants: number;
    customers: number;
    orders: number;
    order_items: number;
    inventory: number;
  };
}

function mappingCount(
  mappings: Array<{ source_type: string; count: number }>,
  sourceType: string,
): number {
  return mappings
    .filter((entry) => entry.source_type === sourceType)
    .reduce((sum, entry) => sum + entry.count, 0);
}

export async function validateMigration(
  migrationId?: string,
): Promise<ValidationResult> {
  if (!migrationId) {
    throw new Error("migration_id is required for TradingWEB reconciliation");
  }

  const session = await getImportSession(migrationId);
  const reconciliation = session.reconciliation;
  if (!reconciliation) {
    throw new Error("TradingWEB did not return reconciliation data");
  }

  const mappings = reconciliation.mappings ?? [];
  const jobFailures = session.jobs.reduce(
    (sum, job) => sum + (job.failed_rows ?? 0),
    0,
  );
  const hasErrors =
    reconciliation.total_errors > 0
    || jobFailures > 0
    || session.status === "failed";

  const details: Record<string, ValidationCategory> = {
    receiver_jobs: {
      status: hasErrors ? "fail" : "pass",
      count: session.jobs.length,
      details: session.jobs.map(
        (job) =>
          `${job.job_type}: ${job.success_rows}/${job.total_rows} succeeded, ${job.failed_rows} failed`,
      ),
    },
    source_mappings: {
      status: mappings.length > 0 ? "pass" : "warning",
      count: mappings.reduce((sum, entry) => sum + entry.count, 0),
      details: mappings.map(
        (entry) =>
          `${entry.source_type} -> ${entry.local_table}: ${entry.count}`,
      ),
    },
    order_reconciliation: {
      status:
        reconciliation.order_totals.currency_count > 1 ? "warning" : "pass",
      count: reconciliation.order_totals.count,
      details: [
        `orders: ${reconciliation.order_totals.count}`,
        `total: ${reconciliation.order_totals.total_amount}`,
        `paid: ${reconciliation.order_totals.paid_amount}`,
        `currency: ${reconciliation.order_totals.currency ?? "n/a"}`,
      ],
    },
  };

  const hasWarning = Object.values(details).some(
    (entry) => entry.status === "warning",
  );
  return {
    overall: hasErrors ? "fail" : hasWarning ? "warning" : "pass",
    details,
    summary: {
      products: mappingCount(mappings, "product"),
      variants: mappingCount(mappings, "variant"),
      customers: mappingCount(mappings, "customer"),
      orders: mappingCount(mappings, "order"),
      order_items: mappingCount(mappings, "order_item"),
      inventory: mappingCount(mappings, "variant"),
    },
  };
}
