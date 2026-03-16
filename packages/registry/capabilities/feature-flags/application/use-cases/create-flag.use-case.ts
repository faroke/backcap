// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { FeatureFlag } from "../../domain/entities/feature-flag.entity.js";
import type { IFlagStore } from "../ports/flag-store.port.js";
import type { CreateFlagInput } from "../dto/create-flag.dto.js";
import type { CreateFlagOutput } from "../dto/create-flag.dto.js";

export class CreateFlag {
  constructor(private readonly flagStore: IFlagStore) {}

  async execute(
    input: CreateFlagInput,
  ): Promise<Result<CreateFlagOutput, Error>> {
    const id = crypto.randomUUID();
    const flagResult = FeatureFlag.create({
      id,
      key: input.key,
      isEnabled: input.isEnabled,
      conditions: input.conditions,
    });

    if (flagResult.isFail()) {
      return Result.fail(flagResult.unwrapError());
    }

    const flag = flagResult.unwrap();
    await this.flagStore.save(flag);

    return Result.ok({
      flagId: flag.id,
      createdAt: flag.createdAt,
    });
  }
}
