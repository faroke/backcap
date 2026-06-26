import { Result } from "../../shared/result.js";
import { ActivityEntry } from "../../domain/entities/activity-entry.entity.js";
import { ActivityRecorded } from "../../domain/events/activity-recorded.event.js";
import type { IActivityStore } from "../ports/activity-store.port.js";
import type { RecordActivityInput, RecordActivityOutput } from "../dto/record-activity.dto.js";
import type { InvalidActor } from "../../domain/errors/invalid-actor.error.js";
import type { InvalidAction } from "../../domain/errors/invalid-action.error.js";
import type { InvalidTarget } from "../../domain/errors/invalid-target.error.js";

export class RecordActivity {
  constructor(private readonly activityStore: IActivityStore) {}

  async execute(
    input: RecordActivityInput,
  ): Promise<
    Result<
      { output: RecordActivityOutput; event: ActivityRecorded },
      InvalidActor | InvalidAction | InvalidTarget
    >
  > {
    const id = crypto.randomUUID();
    const entryResult = ActivityEntry.create({
      id,
      actor: input.actor,
      action: input.action,
      targetId: input.targetId,
      targetName: input.targetName,
      metadata: input.metadata,
    });

    if (entryResult.isFail()) {
      return Result.fail(entryResult.unwrapError());
    }

    const entry = entryResult.unwrap();
    await this.activityStore.append(entry);

    const event = new ActivityRecorded(
      entry.id,
      entry.actor.id,
      entry.actor.displayName,
      entry.action.value,
      entry.targetId,
      entry.targetName,
    );

    return Result.ok({
      output: {
        entryId: entry.id,
        occurredAt: entry.occurredAt,
      },
      event,
    });
  }
}
