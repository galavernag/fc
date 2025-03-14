import { describe, test, expect } from "bun:test";
import type { Converter } from "../../../src/schemas/converter";
import { ConverterSchema } from "../../../src/schemas/converter";

describe("ConverterSchema", () => {
  test("should validate a valid converter object with all required fields", () => {
    // Arrange
    const validConverter = {
      name: "json-to-yaml",
      description: "Converts JSON files to YAML format",
      sourceFormats: ["json"],
      targetFormats: ["yaml"],
      convert: async (
        source: string,
        target: string,
        options: Record<string, any>
      ) => {
        // Mock implementation
        return true;
      },
      getOptions: () => ({
        indentation: {
          description: "Number of spaces for indentation",
          required: false,
          default: 2,
        },
      }),
    };

    // Act & Assert
    expect(() => ConverterSchema.parse(validConverter)).not.toThrow();
    const parsed = ConverterSchema.parse(validConverter);
    expect(parsed.name).toBe("json-to-yaml");
    expect(parsed.sourceFormats).toEqual(["json"]);
    expect(parsed.targetFormats).toEqual(["yaml"]);
    expect(typeof parsed.convert).toBe("function");
    expect(typeof parsed.getOptions).toBe("function");
  });

  test("should validate a converter without optional getOptions method", () => {
    // Arrange
    const validConverter = {
      name: "json-to-yaml",
      description: "Converts JSON files to YAML format",
      sourceFormats: ["json"],
      targetFormats: ["yaml"],
      convert: async (
        source: string,
        target: string,
        options: Record<string, any>
      ) => {
        // Mock implementation
        return true;
      },
      // No getOptions method
    };

    // Act & Assert
    expect(() => ConverterSchema.parse(validConverter)).not.toThrow();
  });

  test("should validate a converter with multiple source and target formats", () => {
    // Arrange
    const validConverter = {
      name: "multi-converter",
      description: "Converts between multiple formats",
      sourceFormats: ["json", "yaml", "toml"],
      targetFormats: ["xml", "csv"],
      convert: async (
        source: string,
        target: string,
        options: Record<string, any>
      ) => {
        // Mock implementation
        return true;
      },
    };

    // Act & Assert
    expect(() => ConverterSchema.parse(validConverter)).not.toThrow();
  });

  test("should fail when name is missing", () => {
    // Arrange
    const invalidConverter = {
      // name is missing
      description: "Converts JSON files to YAML format",
      sourceFormats: ["json"],
      targetFormats: ["yaml"],
      convert: async (
        source: string,
        target: string,
        options: Record<string, any>
      ) => true,
    } as any;

    // Act & Assert
    expect(() => ConverterSchema.parse(invalidConverter)).toThrow();
  });

  test("should fail when description is missing", () => {
    // Arrange
    const invalidConverter = {
      name: "json-to-yaml",
      // description is missing
      sourceFormats: ["json"],
      targetFormats: ["yaml"],
      convert: async (
        source: string,
        target: string,
        options: Record<string, any>
      ) => true,
    } as any;

    // Act & Assert
    expect(() => ConverterSchema.parse(invalidConverter)).toThrow();
  });

  test("should fail when sourceFormats is empty", () => {
    // Arrange
    const invalidConverter = {
      name: "json-to-yaml",
      description: "Converts JSON files to YAML format",
      sourceFormats: [], // Empty array
      targetFormats: ["yaml"],
      convert: async (
        source: string,
        target: string,
        options: Record<string, any>
      ) => true,
    };

    // Act & Assert
    const error = expect(() =>
      ConverterSchema.parse(invalidConverter)
    ).toThrow();
    expect(() => ConverterSchema.parse(invalidConverter)).toThrow(
      "Source formats cannot be empty"
    );
  });

  test("should fail when targetFormats is empty", () => {
    // Arrange
    const invalidConverter = {
      name: "json-to-yaml",
      description: "Converts JSON files to YAML format",
      sourceFormats: ["json"],
      targetFormats: [], // Empty array
      convert: async (
        source: string,
        target: string,
        options: Record<string, any>
      ) => true,
    };

    // Act & Assert
    expect(() => ConverterSchema.parse(invalidConverter)).toThrow(
      "Target formats cannot be empty"
    );
  });

  test("should fail when convert method is not a function", () => {
    // Arrange
    const invalidConverter = {
      name: "json-to-yaml",
      description: "Converts JSON files to YAML format",
      sourceFormats: ["json"],
      targetFormats: ["yaml"],
      convert: "not a function", // Not a function
    } as any;

    // Act & Assert
    expect(() => ConverterSchema.parse(invalidConverter)).toThrow();
  });

  test("should validate options with all required fields", () => {
    // Arrange
    const validConverter = {
      name: "json-to-yaml",
      description: "Converts JSON files to YAML format",
      sourceFormats: ["json"],
      targetFormats: ["yaml"],
      convert: async (
        source: string,
        target: string,
        options: Record<string, any>
      ) => true,
      getOptions: () => ({
        indentation: {
          description: "Number of spaces for indentation",
          required: true,
          default: 2,
        },
        sortKeys: {
          description: "Sort object keys alphabetically",
          required: false,
          // No default provided
        },
      }),
    };

    // Act & Assert
    expect(() => ConverterSchema.parse(validConverter)).not.toThrow();
  });

  test("type inference works correctly", () => {
    // This is not a runtime test, but ensures the type is defined correctly
    const converter: Converter = {
      name: "json-to-yaml",
      description: "Converts JSON files to YAML format",
      sourceFormats: ["json"],
      targetFormats: ["yaml"],
      convert: async (source, target, options) => {
        return true;
      },
      getOptions: () => ({
        indentation: {
          description: "Number of spaces",
          required: false,
          default: 2,
        },
      }),
    };

    // Just to use the variable to avoid TypeScript warnings
    expect(converter.name).toBe("json-to-yaml");
  });
});
