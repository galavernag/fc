import { Command } from "commander";
import { ConverterManager } from "../core/converter-manager";
import { createConverterAddCommand } from "./add";
import { createConverterConvertCommand } from "./convert";
import { createConverterListCommand } from "./list";
import { createConverterRemoveCommand } from "./remove";

export function createCommands(converterManager: ConverterManager): Command {
  const program = new Command()
    .name("fc")
    .description("Your favorite file converter")
    .version("1.0.0");

  program.addCommand(createConverterAddCommand(converterManager));
  program.addCommand(createConverterConvertCommand(converterManager));
  const converterCommand = new Command("converter").description(
    "Manage converters"
  );

  converterCommand.addCommand(createConverterAddCommand(converterManager));
  converterCommand.addCommand(createConverterRemoveCommand(converterManager));
  converterCommand.addCommand(createConverterListCommand(converterManager));

  program.addCommand(converterCommand);

  return program;
}
