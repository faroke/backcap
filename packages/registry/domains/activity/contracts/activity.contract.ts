import type { Result } from "../shared/result.js";
import type { RecordActivityInput, RecordActivityOutput } from "../application/dto/record-activity.dto.js";
import type { GetFeedInput, GetFeedOutput } from "../application/dto/get-feed.dto.js";
import type { GetTimelineInput, GetTimelineOutput } from "../application/dto/get-timeline.dto.js";

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
  record(input: RecordActivityInput): Promise<Result<RecordActivityOutput, Error>>;
  getFeed(input: GetFeedInput): Promise<Result<GetFeedOutput, Error>>;
  getTimeline(input: GetTimelineInput): Promise<Result<GetTimelineOutput, Error>>;
}
