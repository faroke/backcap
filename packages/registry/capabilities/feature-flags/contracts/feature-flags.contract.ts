import type { Result } from "../shared/result.js";
import type { EvaluateFlagInput, EvaluateFlagOutput } from "../application/dto/evaluate-flag.dto.js";
import type { CreateFlagInput, CreateFlagOutput } from "../application/dto/create-flag.dto.js";
import type { ToggleFlagInput, ToggleFlagOutput } from "../application/dto/toggle-flag.dto.js";

export interface IFeatureFlagsService {
  evaluate(input: EvaluateFlagInput): Promise<Result<EvaluateFlagOutput, Error>>;
  create(input: CreateFlagInput): Promise<Result<CreateFlagOutput, Error>>;
  toggle(input: ToggleFlagInput): Promise<Result<ToggleFlagOutput, Error>>;
}
