import { NextRequest } from 'next/server';
import { requireUser, errorResponse } from '@/services/auth/auth-middleware';
import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/services/admin/dashboard';

// GET /api/admin/dashboard
export async function GET(request: NextRequest) {
  try {
    await requireUser(request);
    const data = await getDashboardStats();
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
