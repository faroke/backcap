// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { FlagNotFound } from "../../domain/errors/flag-not-found.error.js";
import { FlagAlreadyInState } from "../../domain/errors/flag-already-in-state.error.js";
import type { IFlagStore } from "../ports/flag-store.port.js";
import type { ToggleFlagInput } from "../dto/toggle-flag.dto.js";
import type { ToggleFlagOutput } from "../dto/toggle-flag.dto.js";

export class ToggleFlag {
  constructor(private readonly flagStore: IFlagStore) {}

  async execute(
    input: ToggleFlagInput,
  ): Promise<Result<ToggleFlagOutput, Error>> {
    const flag = await this.flagStore.findByKey(input.key);
    if (!flag) {
      return Result.fail(FlagNotFound.create(input.key));
    }

    if (flag.isEnabled === input.enabled) {
      return Result.fail(FlagAlreadyInState.create(input.key, input.enabled));
    }

    const { flag: updatedFlag } = input.enabled
      ? flag.enable()
      : flag.disable();

    await this.flagStore.save(updatedFlag);

    return Result.ok({
      key: updatedFlag.key.value,
      isEnabled: updatedFlag.isEnabled,
      updatedAt: new Date(),
    });
  }
}
