"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authHeaders } from "@/lib/client-auth"

interface ProgressData {
  type: string
  status: "pending" | "running" | "completed" | "failed"
  total: number
  success: number
  failed: number
}

export function MigrationProgressBar({ migrationId }: { migrationId: string }) {
  const [progress, setProgress] = useState<ProgressData | null>(null)

  useEffect(() => {
    if (!migrationId) return
    const interval = setInterval(async () => {
      try {
        const headers = authHeaders()
        if (!headers) { clearInterval(interval); return }
        const res = await fetch(`/api/admin/migration/progress?id=${migrationId}`, { headers })
        if (!res.ok) { clearInterval(interval); return }
        const data = (await res.json()).data
        setProgress(data)
        if (data?.status === "completed" || data?.status === "failed") {
          clearInterval(interval)
        }
      } catch {
        // ignore polling errors
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [migrationId])

  if (!progress) return null

  const total = progress.total || 1
  const done = progress.success + progress.failed
  const pct = Math.round((done / total) * 100)

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          {progress.type}
          {progress.status === "running" ? " running..." : ""}
          {progress.status === "completed" ? " complete" : ""}
          {progress.status === "failed" ? " failed" : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={"bg-blue-600 h-2.5 rounded-full transition-all duration-300"}
            style={{ width: `${pct}%` }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {done} / {total} ({pct}%)
        </p>
      </CardContent>
    </Card>
  )
}
