import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "src/schemas/registry.schema",
    "src/schemas/registry-item.schema",
    "src/schemas/config.schema",
    "src/types/registry.types",
    "src/types/config.types",
    "src/types/capability.types",
    "src/result",
  ],
  declaration: true,
  rollup: {
    emitCJS: false,
  },
});
