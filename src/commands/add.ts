import { Command } from "commander";
import type { ConverterManager } from "../core/converter-manager";

export function createConverterAddCommand(
  converterManager: ConverterManager
): Command {
  return new Command("add")
    .description("Add a new converter")
    .argument("<github-url>", "The GitHub repository URL of the converter")
    .action(async (repoURL) => {
      console.log(`Adding converter: ${repoURL}`);
      const success = await converterManager.addConverter(repoURL);
      if (success) {
        console.log(`Added converter: ${repoURL}`);
      } else {
        console.error(`Failed to add converter: ${repoURL}`);
      }
    });
}
