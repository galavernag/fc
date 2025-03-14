import { join } from "path";
import { ConverterSchema, type Converter } from "../schemas/converter";
import { exists } from "fs/promises";
import { mkdir } from "fs/promises";
import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";
import type { Registry } from "../schemas/registry";

export class ConverterManager {
  private convertersDirectory: string;
  private convertersRegistry: string;
  private loadedConverters: Map<string, Converter> = new Map();
  private registry: Registry = { converters: [] };

  constructor(baseDirectory: string) {
    this.convertersDirectory = join(baseDirectory, "converters");
    this.convertersRegistry = join(
      baseDirectory,
      "converters",
      "registry.json"
    );
  }

  async initialize(): Promise<boolean> {
    try {
      if (!(await exists(this.convertersDirectory))) {
        await mkdir(this.convertersDirectory, { recursive: true });
      }

      if (!(await exists(this.convertersRegistry))) {
        await writeFile(
          this.convertersRegistry,
          JSON.stringify(
            {
              converters: [],
            },
            null,
            2
          )
        );
      }

      this.registry = JSON.parse(
        await readFile(this.convertersRegistry, "utf-8")
      );
      await this.loadConverters();

      return true;
    } catch (error) {
      console.error(`Error while initializing converter manager.`);
      if (process.env.DEBUG) {
        console.error(error);
      }
      return false;
    }
  }

  async loadConverters(): Promise<boolean> {
    try {
      for (const converter of this.registry.converters) {
        const converterPath = join(this.convertersDirectory, converter.name);
        const buildFile = join(converterPath, "dist", "index.js");

        if ((await exists(converterPath)) && (await exists(buildFile))) {
          const module = await import(buildFile);
          const converter = module.default as Converter;
          this.loadedConverters.set(converter.name, converter);
          console.log(`Loaded converter: ${converter.name}`);
        } else {
          console.error(`Converter "${converter.name}" not found`);
        }
      }

      return true;
    } catch (error) {
      console.error(`Error while loading conveters.`);
      if (process.env.DEBUG) {
        console.error(error);
      }
      return false;
    }
  }

  async addConverter(repoURL: string): Promise<boolean> {
    try {
      const repoName = repoURL.split("/").pop()?.replace(".git", "") || "";

      if (
        this.registry.converters.some(
          (converter) => converter.name === repoName
        )
      ) {
        console.error(`Converter "${repoName}" already exists`);
        return false;
      }

      const converterDirectory = join(this.convertersDirectory, repoName);

      // Clone the repository
      const cloneProcess = Bun.spawn(
        ["git", "clone", repoURL, converterDirectory],
        {
          onExit(subprocess, exitCode, signalCode, error) {
            if (exitCode !== 0 || error) {
              console.error(`Error cloning repository: ${repoURL}`);
              if (process.env.DEBUG) {
                console.error(error);
              }
              return;
            }
          },
        }
      );
      await cloneProcess.exited;

      // Install dependencies
      const installProcess = Bun.spawn(["bun", "install"], {
        cwd: converterDirectory,
        stdout: "pipe",
        stderr: "pipe",
        onExit(proc, exitCode, signalCode, error) {
          if (exitCode !== 0 || error) {
            console.error(`Error installing dependencies for: ${repoURL}`);
            if (process.env.DEBUG) {
              console.error(error);
            }
            return;
          }
        },
      });
      await installProcess.exited;

      // Build converter
      const buildProcess = Bun.spawn(["bun", "run", "build"], {
        cwd: converterDirectory,
        onExit(proc, exitCode, signalCode, error) {
          if (exitCode !== 0 || error) {
            console.error(`Error building converter: ${repoURL}`);
            if (process.env.DEBUG) {
              console.error(error);
            }
            return;
          }
        },
      });
      await buildProcess.exited;

      const converterModule = await import(
        join(converterDirectory, "dist", "index.js")
      );
      const converter = converterModule.default as Converter;
      if (!ConverterSchema.safeParse(converter).success) {
        console.error(`Converter "${repoName}" dosen't have a valid schema.`);
        return false;
      }

      this.registry.converters.push({
        name: repoName,
        github: repoURL,
        installedAt: new Date().toISOString(),
      });

      await writeFile(
        this.convertersRegistry,
        JSON.stringify(this.registry, null, 2),
        "utf-8"
      );

      this.loadedConverters.set(repoName, converter);
      console.log(`Added converter: ${repoName}`);
      return true;
    } catch (error) {
      console.error(`Error while adding converter: ${repoURL}`);
      if (process.env.DEBUG) {
        console.error(error);
      }
      return false;
    }
  }

  async removeConverter(converterName: string): Promise<boolean> {
    try {
      const converterIndex = this.registry.converters.findIndex(
        (converter) => converter.name === converterName
      );
      if (converterIndex === -1) {
        console.error(`Converter "${converterName}" not found`);
        return false;
      }

      this.registry.converters.splice(converterIndex, 1);
      await writeFile(
        this.convertersRegistry,
        JSON.stringify(this.registry, null, 2),
        "utf-8"
      );

      this.loadedConverters.delete(converterName);

      const converterDirectory = join(this.convertersDirectory, converterName);
      if (await exists(converterDirectory)) {
        const removeProcess = Bun.spawn(["rm", "-rf", converterDirectory], {
          onExit(proc, exitCode, signalCode, error) {
            if (exitCode !== 0 || error) {
              console.error(`Error removing converter: ${converterName}`);
              if (process.env.DEBUG) {
                console.error(error);
              }
              return;
            }
          },
        });
        await removeProcess.exited;
      }

      console.log(`Removed converter: ${converterName}`);
      return true;
    } catch (error) {
      console.error(`Error while removing converter: ${converterName}`);
      if (process.env.DEBUG) {
        console.error(error);
      }
      return false;
    }
  }

  listConverters(): (Pick<Converter, "name" | "description"> & {
    formats: string[];
  })[] {
    return Array.from(this.loadedConverters.entries()).map(
      ([name, converter]) => ({
        name,
        description: converter.description,
        formats: converter.sourceFormats
          .map((src) =>
            converter.targetFormats.map((target) => `${src} -> ${target}`)
          )
          .flat(),
      })
    );
  }

  getConverter(sourceFormat: string, targetFormat: string): Converter | null {
    for (const converter of this.loadedConverters.values()) {
      if (
        converter.sourceFormats.includes(sourceFormat) &&
        converter.targetFormats.includes(targetFormat)
      ) {
        return converter;
      }
    }
    return null;
  }
}
