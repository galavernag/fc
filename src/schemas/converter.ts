import { z } from "zod";

const OptionSchema = z.object({
  description: z.string(),
  required: z.boolean(),
  default: z.any().optional(),
});

export const ConverterSchema = z.object({
  name: z.string(),
  description: z.string(),
  sourceFormats: z.array(z.string()),
  targetFormats: z.array(z.string()),
  convert: z
    .function()
    .args(z.string(), z.string(), z.record(z.string(), z.any().optional()))
    .returns(z.promise(z.boolean())),
  getOptions: z
    .function()
    .args()
    .returns(z.record(z.string(), OptionSchema))
    .optional(),
});

export type Converter = z.infer<typeof ConverterSchema>;
