import { NextRequest, NextResponse } from 'next/server';
import { validateMigration } from '@/services/migration/validator';
import { requireUser, errorResponse } from '@/services/auth/auth-middleware';

// POST /api/migrate/validate — 验证迁移数据完整性
export async function POST(request: NextRequest) {
  try {
    await requireUser(request);
    const body = await request.json();
    const { migration_id } = body as { migration_id?: string };

    const result = await validateMigration(migration_id);
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
