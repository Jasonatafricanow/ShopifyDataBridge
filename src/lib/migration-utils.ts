import { getSupabaseClient } from '@/storage/database/supabase-client';

export function getClient() {
  return getSupabaseClient();
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 500);
}

// Ensure unique slug by appending a suffix if needed
export async function ensureUniqueSlug(table: string, baseSlug: string, excludeId?: string): Promise<string> {
  const client = getClient();
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    let query = client.from(table).select('id').eq('slug', slug);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`检查slug唯一性失败: ${error.message}`);
    if (!data) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
