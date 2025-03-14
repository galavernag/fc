// test/unit/core/converter-manager.test.ts
import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { ConverterManager } from "../../../src/core/converter-manager";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

describe("ConverterManager", () => {
  let testDir: string;
  let converterManager: ConverterManager;

  beforeEach(async () => {
    // Create temporary directory for tests
    testDir = join(tmpdir(), `fc-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });

    // Initialize the converter manager with the temporary directory
    converterManager = new ConverterManager(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  test("initialize() should create necessary structures", async () => {
    const result = await converterManager.initialize();

    expect(result).toBe(true);

    // Verify if the directory and registry file were created
    const registryPath = join(testDir, "converters", "registry.json");
    const registryContent = await Bun.file(registryPath).text();
    const registry = JSON.parse(registryContent);

    expect(registry).toHaveProperty("converters");
    expect(Array.isArray(registry.converters)).toBe(true);
  });

  test("listConverters() should return an empty list when there are no converters", async () => {
    await converterManager.initialize();

    const converters = converterManager.listConverters();
    expect(converters).toBeInstanceOf(Array);
    expect(converters.length).toBe(0);
  });

  test("getConverter() should return null when the converter doesn't exist", async () => {
    await converterManager.initialize();

    const converter = converterManager.getConverter("json", "yaml");
    expect(converter).toBeNull();
  });

  // Mock for converter addition tests
  test("addConverter() should add a converter correctly", async () => {
    await converterManager.initialize();

    // Mock the clone, installation, and build process
    const originalSpawn = Bun.spawn;
    // @ts-ignore - Mock for testing purposes
    Bun.spawn = mock((...args) => {
      // Simulate successful process
      const mockProcess = {
        exited: Promise.resolve(0),
      };
      return mockProcess;
    });

    // Mock the converter module import
    const originalImport = import.meta.require;
    // @ts-ignore - Mock for testing purposes
    global.import = mock((path) => {
      return {
        default: {
          name: "mock-converter",
          description: "A mocked converter for tests",
          sourceFormats: ["json"],
          targetFormats: ["yaml"],
          convert: async () => true,
          getOptions: () => ({}),
        },
      };
    });

    // Create directory structure and file necessary for testing
    const converterDir = join(testDir, "converters", "test-converter");
    const distDir = join(converterDir, "dist");
    await mkdir(distDir, { recursive: true });
    await writeFile(
      join(distDir, "index.js"),
      `export default {
        name: "test-converter",
        description: "A test converter",
        sourceFormats: ["json"],
        targetFormats: ["yaml"],
        convert: async () => true,
        getOptions: () => ({}),
      };`
    );

    const result = await converterManager.addConverter(
      "https://github.com/user/test-converter"
    );

    // Restore original functions
    Bun.spawn = originalSpawn;
    // @ts-ignore
    global.import = originalImport;

    expect(result).toBe(true);

    // Verify if the converter was added to the registry
    const registryPath = join(testDir, "converters", "registry.json");
    const registryContent = await Bun.file(registryPath).text();
    const registry = JSON.parse(registryContent);

    expect(registry.converters.length).toBeGreaterThan(0);
    expect(registry.converters[0].name).toBe("test-converter");
  });
});
