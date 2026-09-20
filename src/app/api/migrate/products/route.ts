import { NextRequest, NextResponse } from 'next/server';
import { importProducts } from '@/services/migration/product-importer';
import { getProgress } from '@/services/migration/csv-importer';
import { requireUser, errorResponse } from '@/services/auth/auth-middleware';

// POST /api/migrate/products — 从 Shopify CSV 导入商品
export async function POST(request: NextRequest) {
  try {
    await requireUser(request);
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: '请上传CSV文件' }, { status: 400 });
    }

    const result = await importProducts(file);
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}

// GET /api/migrate/products — 查询迁移进度
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
