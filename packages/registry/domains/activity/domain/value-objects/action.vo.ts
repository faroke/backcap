import { Result } from "../../shared/result.js";
import { InvalidAction } from "../errors/invalid-action.error.js";

const ACTION_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export class Action {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<Action, InvalidAction> {
    if (!ACTION_REGEX.test(value)) {
      return Result.fail(InvalidAction.create(value));
    }
    return Result.ok(new Action(value));
  }
}
