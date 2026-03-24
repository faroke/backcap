import { Result } from "../../shared/result.js";
import { QueryFailed } from "../../domain/errors/query-failed.error.js";
import type { IActivityStore } from "../ports/activity-store.port.js";
import type { GetFeedInput, GetFeedOutput } from "../dto/get-feed.dto.js";
import type { ActivityEntryOutput } from "../dto/activity-entry-output.dto.js";
import type { ActivityEntry } from "../../domain/entities/activity-entry.entity.js";

function toEntryOutput(entry: ActivityEntry): ActivityEntryOutput {
  return {
    id: entry.id,
    actor: { id: entry.actor.id, displayName: entry.actor.displayName },
    action: entry.action.value,
    targetId: entry.targetId,
    targetName: entry.targetName,
    summary: entry.summary,
    metadata: entry.metadata,
    occurredAt: entry.occurredAt,
  };
}

export class GetFeed {
  constructor(private readonly activityStore: IActivityStore) {}

  async execute(input: GetFeedInput): Promise<Result<GetFeedOutput, Error>> {
    try {
      const { entries, total } = await this.activityStore.query({
        actorId: input.actorId,
        action: input.action,
        targetId: input.targetId,
        fromDate: input.fromDate,
        toDate: input.toDate,
        limit: input.limit,
        offset: input.offset,
      });

      return Result.ok({
        entries: entries.map(toEntryOutput),
        total,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(QueryFailed.create(message));
    }
  }
}
