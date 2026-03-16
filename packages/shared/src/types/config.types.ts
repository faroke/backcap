import type { z } from "zod";
import type { configSchema, configPathsSchema } from "../schemas/config.schema.js";

export type BackcapConfig = z.infer<typeof configSchema>;
export type ConfigPaths = z.infer<typeof configPathsSchema>;
