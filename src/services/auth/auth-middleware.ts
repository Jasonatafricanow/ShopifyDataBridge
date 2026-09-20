/**
 * MoveShopify — 认证中间件
 *
 * 从 Bearer Token 提取用户身份，验证后返回用户信息。
 */
import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/** 解析 Bearer Token 并返回用户信息 */
export async function requireUser(request: Request): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  const client = getSupabaseClient(token);
  const { data, error } = await client.auth.getUser(token);

  if (error || !data?.user) {
    throw new AuthError('Invalid or expired token');
  }

  return {
    id: data.user.id,
    email: data.user.email || '',
  };
}

/** 统一错误响应处理 */
export function errorResponse(err: unknown): Response {
  if (err instanceof AuthError) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
