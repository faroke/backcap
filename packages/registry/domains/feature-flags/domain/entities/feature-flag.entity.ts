import { Result } from "../../shared/result.js";
import { FlagKey } from "../value-objects/flag-key.vo.js";
import { FlagToggled } from "../events/flag-toggled.event.js";
import { InvalidFlagKey } from "../errors/invalid-flag-key.error.js";

export class FeatureFlag {
  readonly id: string;
  readonly key: FlagKey;
  readonly isEnabled: boolean;
  readonly conditions: Record<string, unknown> | undefined;
  readonly createdAt: Date;

  private constructor(
    id: string,
    key: FlagKey,
    isEnabled: boolean,
    conditions: Record<string, unknown> | undefined,
    createdAt: Date,
  ) {
    this.id = id;
    this.key = key;
    this.isEnabled = isEnabled;
    this.conditions = conditions;
    this.createdAt = createdAt;
  }

  static create(params: {
    id: string;
    key: string;
    isEnabled?: boolean;
    conditions?: Record<string, unknown>;
    createdAt?: Date;
  }): Result<FeatureFlag, InvalidFlagKey> {
    const keyResult = FlagKey.create(params.key);
    if (keyResult.isFail()) {
      return Result.fail(keyResult.unwrapError());
    }

    return Result.ok(
      new FeatureFlag(
        params.id,
        keyResult.unwrap(),
        params.isEnabled ?? false,
        params.conditions,
        params.createdAt ?? new Date(),
      ),
    );
  }

  enable(): { flag: FeatureFlag; event: FlagToggled } {
    const flag = new FeatureFlag(
      this.id,
      this.key,
      true,
      this.conditions,
      this.createdAt,
    );
    const event = new FlagToggled(this.id, this.key.value, true);
    return { flag, event };
  }

  disable(): { flag: FeatureFlag; event: FlagToggled } {
    const flag = new FeatureFlag(
      this.id,
      this.key,
      false,
      this.conditions,
      this.createdAt,
    );
    const event = new FlagToggled(this.id, this.key.value, false);
    return { flag, event };
  }
}
