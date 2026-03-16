import { z } from "zod";

export const templateMarkerSchema = z.object({
  key: z.string(),
  configPath: z.string(),
}).strict();

export const registryItemFileSchema = z.object({
  path: z.string(),
  type: z.enum(["source", "template", "config"]),
  content: z.string().optional(),
}).strict();

export const registryItemSchema = z.object({
  name: z.string(),
  type: z.enum(["capability", "adapter", "bridge", "skill"]),
  description: z.string(),
  files: z.array(registryItemFileSchema),
  dependencies: z.union([z.record(z.string()), z.array(z.string())]).optional(),
  peerDependencies: z.record(z.string()).optional(),
  templateMarkers: z.union([
    z.array(templateMarkerSchema),
    z.array(z.string()),
  ]).optional(),
}).passthrough();

export type RegistryItem = z.infer<typeof registryItemSchema>;
