import { Result } from "../../shared/result.js";
import { InvalidActor } from "../errors/invalid-actor.error.js";

export class Actor {
  readonly id: string;
  readonly displayName: string;

  private constructor(id: string, displayName: string) {
    this.id = id;
    this.displayName = displayName;
  }

  static create(params: {
    id: string;
    displayName: string;
  }): Result<Actor, InvalidActor> {
    if (!params.id || params.id.trim().length === 0) {
      return Result.fail(InvalidActor.create("id must not be empty"));
    }
    if (!params.displayName || params.displayName.trim().length === 0) {
      return Result.fail(InvalidActor.create("displayName must not be empty"));
    }
    return Result.ok(new Actor(params.id.trim(), params.displayName.trim()));
  }
}
