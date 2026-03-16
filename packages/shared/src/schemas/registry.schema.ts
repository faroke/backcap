import { z } from "zod";
import { registryItemSchema } from "./registry-item.schema.js";

export const registrySchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  items: z.array(registryItemSchema),
}).passthrough();

export type Registry = z.infer<typeof registrySchema>;
