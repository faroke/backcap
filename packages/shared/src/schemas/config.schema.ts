import { z } from "zod";

export const configPathsSchema = z.object({
  domains: z.string(),
  adapters: z.string(),
  bridges: z.string(),
  skills: z.string(),
  shared: z.string(),
}).strict();

export const configSchema = z.object({
  framework: z.string(),
  packageManager: z.string(),
  paths: configPathsSchema,
  alias: z.string().default("@domains"),
}).passthrough();

export type BackcapConfig = z.infer<typeof configSchema>;
