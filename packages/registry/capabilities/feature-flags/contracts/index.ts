export type {
  IFeatureFlagsService,
} from "./feature-flags.contract.js";

export { createFeatureFlagsCapability } from "./feature-flags.factory.js";
export type { FeatureFlagsServiceDeps } from "./feature-flags.factory.js";

export type { IFlagStore } from "../application/ports/flag-store.port.js";
export { FeatureFlag } from "../domain/entities/feature-flag.entity.js";
export { FlagKey } from "../domain/value-objects/flag-key.vo.js";
