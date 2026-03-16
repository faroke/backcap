import { z } from "zod";

export const configPathsSchema = z.object({
  capabilities: z.string(),
  adapters: z.string(),
  bridges: z.string(),
  skills: z.string(),
  shared: z.string(),
}).strict();

export const installedCapabilitySchema = z.object({
  name: z.string(),
  version: z.string(),
  adapters: z.array(z.string()),
  partial: z.boolean().optional(),
});

export const installedBridgeSchema = z.object({
  name: z.string(),
  version: z.string(),
});

const installedObjectSchema = z.object({
  capabilities: z.array(installedCapabilitySchema).default([]),
  bridges: z.array(installedBridgeSchema).default([]),
});

export const installedSchema = z.preprocess(
  (val) => {
    // Migrate old format (array) to new structured format
    if (Array.isArray(val)) {
      return { capabilities: [], bridges: [] };
    }
    if (val === undefined || val === null) {
      return { capabilities: [], bridges: [] };
    }
    return val;
  },
  installedObjectSchema,
);

export const configSchema = z.object({
  framework: z.string(),
  packageManager: z.string(),
  paths: configPathsSchema,
  installed: installedSchema,
}).passthrough();

export type BackcapConfig = z.infer<typeof configSchema>;
