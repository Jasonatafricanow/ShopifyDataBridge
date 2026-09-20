import { NextRequest, NextResponse } from 'next/server';
import { importOrders } from '@/services/migration/order-importer';
import { getProgress } from '@/services/migration/csv-importer';
import { errorResponse, requireUser } from '@/services/auth/auth-middleware';

// POST /api/migrate/orders — 从 Shopify CSV 导入订单
export async function POST(request: NextRequest) {
  try {
    await requireUser(request);
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: '请上传CSV文件' }, { status: 400 });
    }

    const result = await importOrders(file);
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireUser(request);
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: '缺少迁移ID' }, { status: 400 });
    const progress = getProgress(id);
    if (!progress) return NextResponse.json({ error: '未找到迁移进度' }, { status: 404 });
    return NextResponse.json(progress);
  } catch (err) {
    return errorResponse(err);
  }
}
