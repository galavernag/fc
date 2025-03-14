import { describe, test, expect } from "bun:test";
import { RegistrySchema } from "../../../src/schemas/registry";
import type { Registry } from "../../../src/schemas/registry";

describe("RegistrySchema", () => {
  test("should validate a valid registry object", () => {
    // Arrange
    const validRegistry = {
      converters: [
        {
          name: "json-to-yaml",
          github: "https://github.com/user/json-to-yaml",
          installedAt: new Date().toISOString(),
        },
        {
          name: "csv-to-json",
          github: "https://github.com/user/csv-to-json",
          installedAt: new Date().toISOString(),
        },
      ],
    };

    // Act & Assert
    expect(() => RegistrySchema.parse(validRegistry)).not.toThrow();
    const parsed = RegistrySchema.parse(validRegistry);
    expect(parsed).toEqual(validRegistry);
  });

  test("should validate an empty converters array", () => {
    // Arrange
    const emptyRegistry = {
      converters: [],
    };

    // Act & Assert
    expect(() => RegistrySchema.parse(emptyRegistry)).not.toThrow();
  });

  test("should fail on missing converters property", () => {
    // Arrange
    const invalidRegistry = {} as any;

    // Act & Assert
    expect(() => RegistrySchema.parse(invalidRegistry)).toThrow();
  });

  test("should fail when converters is not an array", () => {
    // Arrange
    const invalidRegistry = {
      converters: "not an array",
    } as any;

    // Act & Assert
    expect(() => RegistrySchema.parse(invalidRegistry)).toThrow();
  });

  test("should fail when converter is missing required properties", () => {
    // Arrange
    const missingProps = {
      converters: [
        {
          name: "json-to-yaml",
          // Missing github and installedAt
        },
      ],
    };

    // Act & Assert
    expect(() => RegistrySchema.parse(missingProps)).toThrow();
  });

  test("should fail when github is not a valid URL", () => {
    // Arrange
    const invalidUrl = {
      converters: [
        {
          name: "json-to-yaml",
          github: "not-a-url",
          installedAt: new Date().toISOString(),
        },
      ],
    };

    // Act & Assert
    expect(() => RegistrySchema.parse(invalidUrl)).toThrow();
  });

  test("should fail when installedAt is not a valid datetime string", () => {
    // Arrange
    const invalidDateTime = {
      converters: [
        {
          name: "json-to-yaml",
          github: "https://github.com/user/json-to-yaml",
          installedAt: "invalid-date",
        },
      ],
    };

    // Act & Assert
    expect(() => RegistrySchema.parse(invalidDateTime)).toThrow();
  });

  test("should successfully parse converters with additional properties", () => {
    // Arrange
    const extraProps = {
      converters: [
        {
          name: "json-to-yaml",
          github: "https://github.com/user/json-to-yaml",
          installedAt: new Date().toISOString(),
          description: "Converts JSON to YAML",
          version: "1.0.0",
        },
      ],
    };

    // Act
    const parsed = RegistrySchema.safeParse(extraProps);

    expect(parsed.success).toBe(true);

    //@ts-expect-error
    expect(parsed.data.converters[0].name).toBe("json-to-yaml");
    //@ts-expect-error
    expect(parsed.data.converters[0].github).toBe(
      "https://github.com/user/json-to-yaml"
    );
    // Extra properties are stripped by default
    //@ts-expect-error
    expect((parsed.data.converters[0] as any).description).toBeUndefined();
  });

  test("type inference works correctly", () => {
    // This is not a runtime test, but ensures the type is defined correctly
    const registry: Registry = {
      converters: [
        {
          name: "json-to-yaml",
          github: "https://github.com/user/json-to-yaml",
          installedAt: new Date().toISOString(),
        },
      ],
    };

    // Just to use the variable to avoid TypeScript warnings
    expect(registry.converters.length).toBe(1);
  });
});
