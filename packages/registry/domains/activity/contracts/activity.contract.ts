import type { Result } from "../shared/result.js";
import type { RecordActivityInput, RecordActivityOutput } from "../application/dto/record-activity.dto.js";
import type { GetFeedInput, GetFeedOutput } from "../application/dto/get-feed.dto.js";
import type { GetTimelineInput, GetTimelineOutput } from "../application/dto/get-timeline.dto.js";
import type { InvalidActor } from "../domain/errors/invalid-actor.error.js";
import type { InvalidAction } from "../domain/errors/invalid-action.error.js";
import type { InvalidTarget } from "../domain/errors/invalid-target.error.js";
import type { QueryFailed } from "../domain/errors/query-failed.error.js";

// Re-export DTO types so consumers can import everything from contracts (matches notifications pattern)
export type {
  RecordActivityInput,
  RecordActivityOutput,
  GetFeedInput,
  GetFeedOutput,
  GetTimelineInput,
  GetTimelineOutput,
};

export interface IActivityService {
  record(
    input: RecordActivityInput,
  ): Promise<Result<RecordActivityOutput, InvalidActor | InvalidAction | InvalidTarget>>;
  getFeed(input: GetFeedInput): Promise<Result<GetFeedOutput, QueryFailed>>;
  getTimeline(input: GetTimelineInput): Promise<Result<GetTimelineOutput, QueryFailed>>;
}
