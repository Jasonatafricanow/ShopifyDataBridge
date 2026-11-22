import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ result: vi.fn(), from: vi.fn(), equal: vi.fn(), exclude: vi.fn() }));
vi.mock("@/storage/database/supabase-client", () => ({ getSupabaseClient: () => ({ from: mocks.from }) }));
import { generateSlug, ensureUniqueSlug } from "@/lib/migration-utils";
beforeEach(() => {
  vi.clearAllMocks();
  const query = { select: () => query, eq: mocks.equal, neq: mocks.exclude, maybeSingle: mocks.result };
  mocks.from.mockReturnValue(query); mocks.equal.mockReturnValue(query); mocks.exclude.mockReturnValue(query);
});
describe("production migration slug utilities", () => {
  it.each([["Hello, World!", "hello-world"], ["中文 商品", "中文-商品"], ["--test--", "test"]])("normalizes %s", (input, expected) => { expect(generateSlug(input)).toBe(expected); });
  it("bounds generated slugs", () => { expect(generateSlug("a".repeat(600))).toHaveLength(500); });
  it("queries successive collisions and excludes the current record", async () => {
    mocks.result.mockResolvedValueOnce({ data: { id: "one" } }).mockResolvedValueOnce({ data: { id: "two" } }).mockResolvedValueOnce({ data: null });
    await expect(ensureUniqueSlug("products", "shoe", "current")).resolves.toBe("shoe-2");
    expect(mocks.equal.mock.calls).toEqual([["slug", "shoe"], ["slug", "shoe-1"], ["slug", "shoe-2"]]);
    expect(mocks.exclude).toHaveBeenCalledWith("id", "current");
  });
  it("does not pretend a database failure proves uniqueness", async () => {
    mocks.result.mockResolvedValueOnce({ data: null, error: { message: "offline" } });
    await expect(ensureUniqueSlug("products", "shoe")).rejects.toThrow("offline");
  });
});
