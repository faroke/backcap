import type { z } from "zod";
import type { registrySchema } from "../schemas/registry.schema.js";
import type { registryItemSchema, registryItemFileSchema, templateMarkerSchema } from "../schemas/registry-item.schema.js";

export type Registry = z.infer<typeof registrySchema>;
export type RegistryItem = z.infer<typeof registryItemSchema>;
export type RegistryItemFile = z.infer<typeof registryItemFileSchema>;
export type TemplateMarker = z.infer<typeof templateMarkerSchema>;
