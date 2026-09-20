import { NextRequest, NextResponse } from "next/server"
import { getProgress } from "@/services/migration/progress"
import { requireUser, errorResponse } from "@/services/auth/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    await requireUser(request)
    const id = request.nextUrl.searchParams.get("id")
    if (!id) {
      return NextResponse.json({ data: [] })
    }
    const progress = getProgress(id)
    if (!progress) {
      return NextResponse.json({ error: "Progress not found" }, { status: 404 })
    }
    return NextResponse.json({ data: progress })
  } catch (err) {
    return errorResponse(err)
  }
}
