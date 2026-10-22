import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requireUser } from "@/services/auth/auth-middleware";
import { getSupabaseClient } from "@/storage/database/supabase-client";

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock("@/storage/database/supabase-client", () => ({
  getSupabaseClient: vi.fn(() => ({ auth: { getUser } })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("MIGRATION_ADMIN_EMAILS", "admin@example.com");
  getUser.mockResolvedValue({ data: { user: { id: "u1", email: "admin@example.com" } }, error: null });
});
afterEach(() => vi.unstubAllEnvs());
const request = (header?: string) => new Request("http://localhost/api/migrate", {
  headers: header ? { authorization: header } : {},
});

describe("production migration authentication", () => {
  it.each([undefined, "Basic token", "Bearer", "Bearer   "])("rejects absent or malformed bearer credentials: %s", async (header) => {
    await expect(requireUser(request(header))).rejects.toMatchObject({ statusCode: 401 });
    expect(getSupabaseClient).not.toHaveBeenCalled();
  });
  it("passes the actual token to identity verification and returns an allowed operator", async () => {
    await expect(requireUser(request("Bearer signed-token"))).resolves.toEqual({ id: "u1", email: "admin@example.com" });
    expect(getSupabaseClient).toHaveBeenCalledWith("signed-token");
    expect(getUser).toHaveBeenCalledWith("signed-token");
  });
  it("rejects a token rejected by the identity provider", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: { message: "expired" } });
    await expect(requireUser(request("Bearer expired-token"))).rejects.toMatchObject({ statusCode: 401 });
  });
  it("rejects authenticated users outside the migration allowlist", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u2", email: "visitor@example.com" } }, error: null });
    await expect(requireUser(request("Bearer visitor-token"))).rejects.toMatchObject({ statusCode: 403 });
  });
});
