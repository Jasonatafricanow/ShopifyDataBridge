/**
 * CSV 导入共享逻辑
 *
 * 提供 CSV 文件解析、迁移进度追踪、批次写入的标准流水线。
 * 各领域 importer 只需要实现字段映射函数即可。
 */
import Papa from 'papaparse'
import { v4 as uuidv4 } from 'uuid'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { setProgress, getProgress, type MigrationProgress } from './progress'

export type RowMapper<T> = (row: Record<string, string>, index: number) => T
export type RowWriter<T> = (client: ReturnType<typeof getSupabaseClient>, mapped: T, row: Record<string, string>, index: number) => Promise<void>

export interface ImportResult {
  migration_id: string
  type: string
  total: number
  success: number
  failed: number
  errors: Array<{ row: number; message: string }>
}

/**
 * 通用 CSV 导入流水线
 * @param file 上传的 CSV 文件
 * @param type 迁移类型（用于日志和进度）
 * @param mapper 将 CSV 行转为中间对象
 * @param writer 将中间对象写入数据库
 */
export async function importCsv<T>(
  file: File,
  type: string,
  mapper: RowMapper<T>,
  writer: RowWriter<T>,
): Promise<ImportResult> {
  const text = await file.text()
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  })

  const migrationId = uuidv4()
  const progress: MigrationProgress = {
    type,
    status: 'running',
    total: parsed.data.length,
    success: 0,
    failed: 0,
    errors: [],
  }
  setProgress(migrationId, progress)

  const client = getSupabaseClient()

  // 记录迁移日志
  await client.from('migration_logs').insert({
    id: migrationId,
    migration_type: type,
    status: 'running',
    source: 'shopify',
    records_total: parsed.data.length,
    started_at: new Date().toISOString(),
  })

  let successCount = 0
  let failCount = 0
  const errors: Array<{ row: number; message: string }> = []

  for (let i = 0; i < parsed.data.length; i++) {
    try {
      const mapped = mapper(parsed.data[i], i)
      await writer(client, mapped, parsed.data[i], i)
      successCount++
    } catch (err) {
      failCount++
      errors.push({ row: i + 1, message: err instanceof Error ? err.message : '未知错误' })
    }
  }

  // 更新进度
  progress.status = failCount === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed')
  progress.success = successCount
  progress.failed = failCount
  progress.errors = errors.slice(0, 100)
  setProgress(migrationId, progress)

  // 更新迁移日志
  await client.from('migration_logs').update({
    status: progress.status,
    records_success: successCount,
    records_failed: failCount,
    error_details: errors.slice(0, 100),
    completed_at: new Date().toISOString(),
  }).eq('id', migrationId)

  return {
    migration_id: migrationId,
    type,
    total: parsed.data.length,
    success: successCount,
    failed: failCount,
    errors: errors.slice(0, 20),
  }
}

/**
 * 分组导入流水线（按 key 对行分组，每组处理一次）
 */
export async function importGroupedCsv<T>(
  file: File,
  type: string,
  groupKey: (row: Record<string, string>) => string,
  groupMapper: (rows: Record<string, string>[], key: string) => T,
  groupWriter: (client: ReturnType<typeof getSupabaseClient>, mapped: T, key: string) => Promise<void>,
): Promise<ImportResult> {
  const text = await file.text()
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  })

  // 按 groupKey 分组
  const groupMap = new Map<string, Record<string, string>[]>()
  for (const row of parsed.data) {
    const key = groupKey(row)
    if (!key) continue
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key)!.push(row)
  }

  const migrationId = uuidv4()
  const progress: MigrationProgress = {
    type,
    status: 'running',
    total: groupMap.size,
    success: 0,
    failed: 0,
    errors: [],
  }
  setProgress(migrationId, progress)

  const client = getSupabaseClient()

  await client.from('migration_logs').insert({
    id: migrationId,
    migration_type: type,
    status: 'running',
    source: 'shopify',
    records_total: groupMap.size,
    started_at: new Date().toISOString(),
  })

  let successCount = 0
  let failCount = 0
  const errors: Array<{ row: number; message: string }> = []

  for (const [key, rows] of groupMap) {
    try {
      const mapped = groupMapper(rows, key)
      await groupWriter(client, mapped, key)
      successCount++
    } catch (err) {
      failCount++
      errors.push({ row: successCount + failCount, message: `${key}: ${err instanceof Error ? err.message : '未知错误'}` })
    }
  }

  progress.status = failCount === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed')
  progress.success = successCount
  progress.failed = failCount
  progress.errors = errors.slice(0, 100)
  setProgress(migrationId, progress)

  await client.from('migration_logs').update({
    status: progress.status,
    records_success: successCount,
    records_failed: failCount,
    error_details: errors.slice(0, 100),
    completed_at: new Date().toISOString(),
  }).eq('id', migrationId)

  return {
    migration_id: migrationId,
    type,
    total: groupMap.size,
    success: successCount,
    failed: failCount,
    errors: errors.slice(0, 20),
  }
}

export { getProgress }
