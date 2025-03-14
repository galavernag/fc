import { Command } from "commander";
import { parse } from "path";
import type { ConverterManager } from "../core/converter-manager";

export function createConverterConvertCommand(
  converterManager: ConverterManager
): Command {
  return new Command("convert")
    .description("Convert a file from one format to another")
    .argument("<input>", "The path to the input file")
    .argument("<output>", "The path to the output file")
    .option("-f, --force", "Overwrite the output file if it already exists")
    .action(async (input, output, options) => {
      try {
        const inputInfo = parse(input);
        const outputInfo = parse(output);

        const sourceFormat = inputInfo.ext.slice(1).toLowerCase();
        const targetFormat = outputInfo.ext
          ? outputInfo.ext.slice(1).toLowerCase()
          : ""; // Infer by the context

        if (!sourceFormat) {
          console.error("Invalid input file format");
          return;
        }

        if (!targetFormat) {
          console.error("Invalid output file format");
          return;
        }

        const converter = converterManager.getConverter(
          sourceFormat,
          targetFormat
        );

        if (!converter) {
          console.error(
            `No converter found for ${sourceFormat} -> ${targetFormat}`
          );
          console.log('Use "fc converter list" to see available converters');
          return;
        }

        console.log(`Converting ${input} to ${output} using ${converter.name}`);

        const sucess = await converter.convert(input, output, options);

        if (sucess) {
          console.log("Conversion successful");
        } else {
          console.error("Conversion failed");
        }
      } catch (error) {
        console.error(`Error converting ${input} to ${output}`);
        if (process.env.DEBUG) {
          console.error(error);
        }
        return;
      }
    });
}
