import { describe, test, expect } from "bun:test";
import { ConverterSchema } from "../../../src/schemas/converter";

describe("ConverterSchema", () => {
  test("should validate a valid converter", () => {
    const validConverter = {
      name: "test-converter",
      description: "A test converter",
      sourceFormats: ["json"],
      targetFormats: ["yaml"],
      convert: async (
        input: string,
        output: string,
        options: Record<string, any>
      ) => {
        return true;
      },
      getOptions: () => ({
        pretty: {
          description: "Format output",
          required: false,
          default: true,
        },
      }),
    };

    const result = ConverterSchema.safeParse(validConverter);
    expect(result.success).toBe(true);
  });

  test("should reject a converter without source formats", () => {
    const invalidConverter = {
      name: "test-converter",
      description: "A test converter",
      sourceFormats: [], // Empty array is invalid
      targetFormats: ["yaml"],
      convert: async (
        input: string,
        output: string,
        options: Record<string, any>
      ) => {
        return true;
      },
    };

    const result = ConverterSchema.safeParse(invalidConverter);
    expect(result.success).toBe(false);
  });
});
