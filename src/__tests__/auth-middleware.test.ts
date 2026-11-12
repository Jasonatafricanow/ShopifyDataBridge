import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), client: vi.fn() }));
vi.mock("@/storage/database/supabase-client", () => ({ getSupabaseClient: mocks.client }));
import { requireUser, errorResponse, AuthError } from "@/services/auth/auth-middleware";
beforeEach(() => { vi.clearAllMocks(); mocks.client.mockReturnValue({ auth: { getUser: mocks.getUser } }); });
describe("production authentication middleware", () => {
  it.each([undefined, "", "Basic token"])("rejects an absent or invalid header %s before provider access", async header => {
    await expect(requireUser(new Request("https://app.test", { headers: header ? { authorization: header } : {} }))).rejects.toBeInstanceOf(AuthError);
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("passes the actual bearer to Supabase and uses its verified identity", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "verified", email: "buyer@example.com" } }, error: null });
    await expect(requireUser(new Request("https://app.test", { headers: { authorization: "Bearer token" } }))).resolves.toEqual({ id: "verified", email: "buyer@example.com" });
    expect(mocks.client).toHaveBeenCalledWith("token"); expect(mocks.getUser).toHaveBeenCalledWith("token");
  });
  it.each([{ data: { user: null }, error: null }, { data: { user: { id: "claimed" } }, error: { message: "expired" } }])("rejects missing identity or provider errors", async result => {
    mocks.getUser.mockResolvedValue(result);
    await expect(requireUser(new Request("https://app.test", { headers: { authorization: "Bearer token" } }))).rejects.toMatchObject({ statusCode: 401 });
  });
  it("preserves explicit auth status and masks internal exceptions", async () => {
    expect(errorResponse(new AuthError("Forbidden", 403)).status).toBe(403);
    const response = errorResponse(new Error("database password=private"));
    expect(response.status).toBe(500); expect(await response.text()).not.toContain("private");
  });
});
