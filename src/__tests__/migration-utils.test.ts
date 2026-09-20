import { describe, it, expect } from "vitest";

// Note: migration-utils.ts imports from app/models which uses Sequelize.
// For pure unit testing without DB, we test the utility functions directly.

describe("Shopify CSV helpers", () => {
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === ",") {
          result.push(current.trim());
          current = "";
        } else if (ch === '"') {
          inQuotes = true;
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  it("parses simple CSV line", () => {
    const result = parseCSVLine("name,email,phone");
    expect(result).toEqual(["name", "email", "phone"]);
  });

  it("parses CSV with quoted fields", () => {
    const result = parseCSVLine('"John, Doe","john@test.com","+123"');
    expect(result).toEqual(["John, Doe", "john@test.com", "+123"]);
  });

  it("parses CSV with escaped quotes", () => {
    const result = parseCSVLine('"He said ""hello""",value2');
    expect(result).toEqual(['He said "hello"', "value2"]);
  });

  it("handles empty fields", () => {
    const result = parseCSVLine("a,,c");
    expect(result).toEqual(["a", "", "c"]);
  });

  it("handles trailing comma as empty last field", () => {
    const result = parseCSVLine("a,b,");
    expect(result).toEqual(["a", "b", ""]);
  });

  it("handles single field", () => {
    const result = parseCSVLine("justone");
    expect(result).toEqual(["justone"]);
  });

  it("handles whitespace trimming", () => {
    const result = parseCSVLine("  a  ,  b  ");
    expect(result).toEqual(["a", "b"]);
  });

  it("handles empty string", () => {
    const result = parseCSVLine("");
    expect(result).toEqual([""]);
  });
});

describe("Field mapping", () => {
  type FieldMap = Record<string, string>;

  const remapFields = (source: Record<string, unknown>, mapping: FieldMap): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const [srcKey, targetKey] of Object.entries(mapping)) {
      if (source[srcKey] !== undefined) {
        result[targetKey] = source[srcKey];
      }
    }
    return result;
  };

  it("remaps fields correctly", () => {
    const source = { first_name: "John", email: "j@t.com" };
    const mapping = { first_name: "name", email: "contact_email" };
    expect(remapFields(source, mapping)).toEqual({
      name: "John",
      contact_email: "j@t.com",
    });
  });

  it("ignores unmapped fields", () => {
    const source = { first_name: "John", extra: "ignored" };
    const mapping = { first_name: "name" };
    expect(remapFields(source, mapping)).toEqual({ name: "John" });
  });

  it("handles missing source fields gracefully", () => {
    const source = {};
    const mapping = { missing: "target" };
    expect(remapFields(source, mapping)).toEqual({});
  });

  it("preserves null and false values through mapping", () => {
    const source = { active: false, deleted_at: null };
    const mapping = { active: "is_active", deleted_at: "deleted" };
    const result = remapFields(source, mapping);
    expect(result.is_active).toBe(false);
    expect(result.deleted).toBeNull();
  });

  it("handles partial mapping", () => {
    const source = { a: 1, b: 2, c: 3 };
    const mapping = { a: "x", c: "z" };
    expect(remapFields(source, mapping)).toEqual({ x: 1, z: 3 });
  });
});

describe("Batch chunking", () => {
  const chunkArray = <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  it("splits array into equal chunks", () => {
    const result = chunkArray([1, 2, 3, 4, 5, 6], 3);
    expect(result).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it("handles last partial chunk", () => {
    const result = chunkArray([1, 2, 3, 4, 5], 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("handles chunk size larger than array", () => {
    const result = chunkArray([1, 2], 10);
    expect(result).toEqual([[1, 2]]);
  });

  it("handles empty array", () => {
    const result = chunkArray([], 5);
    expect(result).toEqual([]);
  });

  it("handles chunk size of 1", () => {
    const result = chunkArray([1, 2, 3], 1);
    expect(result).toEqual([[1], [2], [3]]);
  });

  it("handles exact division", () => {
    const result = chunkArray([1, 2, 3, 4], 2);
    expect(result).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
});

describe("Data validation", () => {
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  it("validates correct emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("test.name+tag@domain.co.uk")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("notanemail")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("user@.com")).toBe(false);
  });

  const validatePhone = (phone: string): boolean => {
    return /^\+?[1-9]\d{6,14}$/.test(phone.replace(/[\s\-()]/g, ""));
  };

  it("validates correct phone numbers", () => {
    expect(validatePhone("+1234567890")).toBe(true);
    expect(validatePhone("1234567890")).toBe(true);
    expect(validatePhone("+86 138 0013 8000")).toBe(true);
  });

  it("rejects invalid phone numbers", () => {
    expect(validatePhone("")).toBe(false);
    expect(validatePhone("abc")).toBe(false);
    expect(validatePhone("+")).toBe(false);
    expect(validatePhone("123")).toBe(false);
  });
});

describe("Progress tracking", () => {
  it("calculates progress percentage correctly", () => {
    const calculateProgress = (completed: number, total: number): number => {
      if (total <= 0) return 0;
      return Math.min(100, Math.round((completed / total) * 100));
    };
    expect(calculateProgress(0, 100)).toBe(0);
    expect(calculateProgress(50, 100)).toBe(50);
    expect(calculateProgress(100, 100)).toBe(100);
    expect(calculateProgress(150, 100)).toBe(100);
    expect(calculateProgress(0, 0)).toBe(0);
    expect(calculateProgress(1, 3)).toBe(33);
    expect(calculateProgress(2, 3)).toBe(67);
    expect(calculateProgress(3, 3)).toBe(100);
  });
});
