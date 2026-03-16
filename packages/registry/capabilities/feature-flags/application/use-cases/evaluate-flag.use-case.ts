// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { FlagNotFound } from "../../domain/errors/flag-not-found.error.js";
import type { IFlagStore } from "../ports/flag-store.port.js";
import type { EvaluateFlagInput } from "../dto/evaluate-flag.dto.js";
import type { EvaluateFlagOutput } from "../dto/evaluate-flag.dto.js";

export class EvaluateFlag {
  constructor(private readonly flagStore: IFlagStore) {}

  async execute(
    input: EvaluateFlagInput,
  ): Promise<Result<EvaluateFlagOutput, Error>> {
    const flag = await this.flagStore.findByKey(input.key);
    if (!flag) {
      return Result.fail(FlagNotFound.create(input.key));
    }

    return Result.ok({
      isEnabled: flag.isEnabled,
      key: flag.key.value,
    });
  }
}
