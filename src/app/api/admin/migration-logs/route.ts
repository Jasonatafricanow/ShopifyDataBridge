import { NextRequest, NextResponse } from 'next/server';
import { requireUser, errorResponse } from '@/services/auth/auth-middleware';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/admin/migration-logs
export async function GET(request: NextRequest) {
  try {
    await requireUser(request);
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('migration_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    return NextResponse.json({ logs: data || [] });
  } catch (err) {
    return errorResponse(err);
  }
}
