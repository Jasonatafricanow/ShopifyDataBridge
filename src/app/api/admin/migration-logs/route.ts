import { NextRequest, NextResponse } from "next/server";

import {
  errorResponse,
  requireUser,
} from "@/services/auth/auth-middleware";
import { listImportSessions } from "@/services/migration/tradingweb-client";

export async function GET(request: NextRequest) {
  try {
    await requireUser(request);
    const sessions = await listImportSessions();
    const logs = sessions.data.map((session) => {
      const totals = session.jobs.reduce(
        (acc, job) => ({
          total: acc.total + (job.total_rows ?? 0),
          success: acc.success + (job.success_rows ?? 0),
          failed: acc.failed + (job.failed_rows ?? 0),
        }),
        { total: 0, success: 0, failed: 0 },
      );
      return {
        id: session.session_id,
        migration_type:
          session.jobs.length === 1
            ? session.jobs[0].job_type
            : "multi",
        status: session.status,
        source: session.source,
        records_total: totals.total,
        records_success: totals.success,
        records_failed: totals.failed,
        error_details: session.jobs.flatMap((job) =>
          (job.errors ?? []).map((error) => ({
            row: error.record_index + 1,
            message: error.message,
          })),
        ),
        created_at: session.started_at,
        completed_at: session.finished_at ?? null,
      };
    });
    return NextResponse.json({ logs });
  } catch (err) {
    return errorResponse(err);
  }
}
