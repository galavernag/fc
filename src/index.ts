import { join } from "path";
import { ConverterManager } from "./core/converter-manager";
import { createCommands } from "./commands";

async function main() {
  try {
    const baseDirectory =
      process.env.FC_BASE_DIR || join(process.env.HOME || "", ".fc");

    const converterManager = new ConverterManager(baseDirectory);
    await converterManager.initialize();

    const program = createCommands(converterManager);
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error("Fatal error:", error);
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
