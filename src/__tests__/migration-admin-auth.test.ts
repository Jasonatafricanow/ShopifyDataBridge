import { afterEach, describe, expect, it } from "vitest";

import {
  AuthError,
  assertMigrationAdmin,
  migrationAdminEmails,
} from "@/services/auth/auth-middleware";

const original = process.env.MIGRATION_ADMIN_EMAILS;

afterEach(() => {
  if (original === undefined) delete process.env.MIGRATION_ADMIN_EMAILS;
  else process.env.MIGRATION_ADMIN_EMAILS = original;
});

describe("migration admin authorization", () => {
  it("fails closed when no administrator allowlist is configured", () => {
    delete process.env.MIGRATION_ADMIN_EMAILS;
    expect(migrationAdminEmails().size).toBe(0);
    expect(() => assertMigrationAdmin("user@example.com")).toThrow(AuthError);
  });

  it("accepts only explicitly configured administrator email addresses", () => {
    process.env.MIGRATION_ADMIN_EMAILS =
      "Admin@Example.com, operator@example.com";

    expect(() => assertMigrationAdmin("admin@example.com")).not.toThrow();
    expect(() => assertMigrationAdmin("OPERATOR@example.com")).not.toThrow();

    try {
      assertMigrationAdmin("other@example.com");
      throw new Error("expected authorization failure");
    } catch (error) {
      expect(error).toBeInstanceOf(AuthError);
      expect((error as AuthError).statusCode).toBe(403);
    }
  });
});
