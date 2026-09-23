import Papa from "papaparse";

import {
  getProgress,
  setProgress,
  type MigrationProgress,
} from "./progress";
import type { ImportBatchResult, ImportJobType } from "./contracts";

export interface ImportResult {
  migration_id: string;
  type: string;
  total: number;
  success: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

export async function parseCsvRows(
  file: File,
): Promise<Record<string, string>[]> {
  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const errors = parsed.errors.filter((error) => error.type !== "Delimiter");
  if (errors.length > 0) {
    throw new Error(
      `CSV parse failed: ${errors
        .slice(0, 5)
        .map((error) => error.message)
        .join("; ")}`,
    );
  }
  return parsed.data;
}

export function groupRows(
  rows: Record<string, string>[],
  keyOf: (row: Record<string, string>) => string,
): Array<[string, Record<string, string>[]]> {
  const groups = new Map<string, Record<string, string>[]>();
  for (const row of rows) {
    const key = keyOf(row).trim();
    if (!key) continue;
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  return [...groups.entries()];
}

export function setRunningProgress(
  id: string,
  type: ImportJobType,
  total: number,
): void {
  setProgress(id, {
    type,
    status: "running",
    total,
    success: 0,
    failed: 0,
    errors: [],
  });
}

export function finishProgress(
  id: string,
  type: ImportJobType,
  result: ImportBatchResult,
): ImportResult {
  const errors = result.errors.map((error) => ({
    row: error.record_index + 1,
    message: error.message,
  }));
  const progress: MigrationProgress = {
    type,
    status: result.failed === 0 ? "completed" : "failed",
    total: result.total,
    success: result.success,
    failed: result.failed,
    errors: errors.slice(0, 100),
  };
  setProgress(id, progress);
  return {
    migration_id: id,
    type,
    total: result.total,
    success: result.success,
    failed: result.failed,
    errors: errors.slice(0, 20),
  };
}

export { getProgress };
