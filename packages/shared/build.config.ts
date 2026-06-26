import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "src/schemas/registry.schema",
    "src/schemas/registry-item.schema",
    "src/schemas/config.schema",
    "src/types/registry.types",
    "src/types/config.types",
    "src/types/domain.types",
    "src/result",
    "src/event-bus.port",
    "src/in-memory-event-bus",
    "src/money.vo",
    "src/errors/money.error",
  ],
  declaration: true,
  rollup: {
    emitCJS: false,
  },
});
