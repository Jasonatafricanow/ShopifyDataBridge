/**
 * 迁移进度追踪（内存级，进程重启后丢失）
 */
export interface MigrationProgress {
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  total: number
  success: number
  failed: number
  errors: Array<{ row: number; message: string }>
}

const progressStore = new Map<string, MigrationProgress>()

export function setProgress(id: string, progress: MigrationProgress) {
  progressStore.set(id, progress)
}

export function getProgress(id: string): MigrationProgress | undefined {
  return progressStore.get(id)
}
