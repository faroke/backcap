import { z } from "zod";

export const configPathsSchema = z.object({
  capabilities: z.string(),
  adapters: z.string(),
  bridges: z.string(),
  skills: z.string(),
  shared: z.string(),
}).strict();

export const configSchema = z.object({
  framework: z.string(),
  packageManager: z.string(),
  paths: configPathsSchema,
  installed: z.array(z.string()).optional(),
}).passthrough();

export type BackcapConfig = z.infer<typeof configSchema>;
