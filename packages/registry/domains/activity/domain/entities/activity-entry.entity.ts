import { Result } from "../../shared/result.js";
import { Actor } from "../value-objects/actor.vo.js";
import { Action } from "../value-objects/action.vo.js";
import { InvalidTarget } from "../errors/invalid-target.error.js";
import type { InvalidActor } from "../errors/invalid-actor.error.js";
import type { InvalidAction } from "../errors/invalid-action.error.js";

export class ActivityEntry {
  readonly id: string;
  readonly actor: Actor;
  readonly action: Action;
  readonly targetId: string;
  readonly targetName: string;
  readonly metadata: Record<string, unknown> | undefined;
  readonly occurredAt: Date;

  private constructor(
    id: string,
    actor: Actor,
    action: Action,
    targetId: string,
    targetName: string,
    metadata: Record<string, unknown> | undefined,
    occurredAt: Date,
  ) {
    this.id = id;
    this.actor = actor;
    this.action = action;
    this.targetId = targetId;
    this.targetName = targetName;
    this.metadata = metadata;
    this.occurredAt = occurredAt;
  }

  get summary(): string {
    return `${this.actor.displayName} ${this.action.value} ${this.targetName}`;
  }

  static create(params: {
    id: string;
    actor: { id: string; displayName: string };
    action: string;
    targetId: string;
    targetName: string;
    metadata?: Record<string, unknown> | undefined;
    occurredAt?: Date;
  }): Result<ActivityEntry, InvalidActor | InvalidAction | InvalidTarget> {
    const actorResult = Actor.create(params.actor);
    if (actorResult.isFail()) {
      return Result.fail(actorResult.unwrapError());
    }

    const actionResult = Action.create(params.action);
    if (actionResult.isFail()) {
      return Result.fail(actionResult.unwrapError());
    }

    if (!params.targetId || params.targetId.trim().length === 0) {
      return Result.fail(InvalidTarget.create("targetId must not be empty"));
    }

    if (!params.targetName || params.targetName.trim().length === 0) {
      return Result.fail(InvalidTarget.create("targetName must not be empty"));
    }

    return Result.ok(
      new ActivityEntry(
        params.id,
        actorResult.unwrap(),
        actionResult.unwrap(),
        params.targetId.trim(),
        params.targetName.trim(),
        params.metadata,
        params.occurredAt ?? new Date(),
      ),
    );
  }
}
