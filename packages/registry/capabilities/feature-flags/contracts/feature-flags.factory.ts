import type { IFlagStore } from "../application/ports/flag-store.port.js";
import { EvaluateFlag } from "../application/use-cases/evaluate-flag.use-case.js";
import { CreateFlag } from "../application/use-cases/create-flag.use-case.js";
import { ToggleFlag } from "../application/use-cases/toggle-flag.use-case.js";
import type { IFeatureFlagsService } from "./feature-flags.contract.js";

export type FeatureFlagsServiceDeps = {
  flagStore: IFlagStore;
};

export function createFeatureFlagsCapability(
  deps: FeatureFlagsServiceDeps,
): IFeatureFlagsService {
  const evaluateFlag = new EvaluateFlag(deps.flagStore);
  const createFlag = new CreateFlag(deps.flagStore);
  const toggleFlag = new ToggleFlag(deps.flagStore);

  return {
    evaluate: (input) => evaluateFlag.execute(input),
    create: (input) => createFlag.execute(input),
    toggle: (input) => toggleFlag.execute(input),
  };
}
