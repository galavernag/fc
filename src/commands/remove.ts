import { Command } from "commander";
import type { ConverterManager } from "../core/converter-manager";

export function createConverterRemoveCommand(
  converterManager: ConverterManager
): Command {
  return new Command("remove")
    .description("Remove a converter")
    .argument("<converter-name>", "The name of the converter to remove")
    .action(async (converterName) => {
      console.log(`Removing converter: ${converterName}`);
      const success = await converterManager.removeConverter(converterName);
      if (success) {
        console.log(`Removed converter: ${converterName}`);
      } else {
        console.error(`Failed to remove converter: ${converterName}`);
      }
    });
}
