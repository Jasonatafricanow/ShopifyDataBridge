/**
 * DataBridge authentication.
 *
 * Supabase is used only as an identity provider for the bridge UI. Migration
 * authorization is a separate allowlist; a valid Supabase account alone does
 * not grant permission to use the server-side TradingWEB import credential.
 */
import { getSupabaseClient } from "@/storage/database/supabase-client";

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export function migrationAdminEmails(): Set<string> {
  const configured = process.env.MIGRATION_ADMIN_EMAILS?.trim();
  if (!configured) return new Set();
  return new Set(
    configured
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function assertMigrationAdmin(email: string): void {
  const admins = migrationAdminEmails();
  if (admins.size === 0) {
    throw new AuthError(
      "MIGRATION_ADMIN_EMAILS is not configured; migration access is disabled",
      503,
    );
  }
  if (!admins.has(email.trim().toLowerCase())) {
    throw new AuthError("Migration administrator access required", 403);
  }
}

export async function requireUser(
  request: Request,
): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid authorization header");
  }

  const token = authHeader.slice(7).trim();
  if (!token) throw new AuthError("Missing or invalid authorization header");

  const client = getSupabaseClient(token);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    throw new AuthError("Invalid or expired token");
  }

  const user = {
    id: data.user.id,
    email: data.user.email || "",
  };
  assertMigrationAdmin(user.email);
  return user;
}

export function errorResponse(err: unknown): Response {
  if (err instanceof AuthError) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
  const message = err instanceof Error ? err.message : "Internal server error";
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
