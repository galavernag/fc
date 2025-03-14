import { Command } from "commander";
import type { ConverterManager } from "../core/converter-manager";

export function createConverterListCommand(
  converterManager: ConverterManager
): Command {
  return new Command("list")
    .description("List available converters")
    .action(async () => {
      console.log("Available converters:");
      const converters = converterManager.listConverters();
      if (converters.length === 0) {
        console.log("No converters found.");
        console.log(
          'Use "fc converter add <github-url>" to add a new converter'
        );
        return;
      }

      console.log("Available converters:");
      console.table(converters);
    });
}
