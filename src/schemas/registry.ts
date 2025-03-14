import { z } from "zod";

export const RegistrySchema = z.object({
  converters: z.array(
    z.object({
      name: z.string(),
      github: z.string().url(),
      installedAt: z.string().datetime(),
    })
  ),
});

export type Registry = z.infer<typeof RegistrySchema>;
