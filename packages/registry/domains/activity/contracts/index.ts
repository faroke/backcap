export type {
  IActivityService,
} from "./activity.contract.js";

export { createActivityService } from "./activity.factory.js";
export type { ActivityServiceDeps } from "./activity.factory.js";

// DTO re-exports (contracts as public API, matching notifications pattern)
export type { ActivityEntryOutput } from "../application/dto/activity-entry-output.dto.js";
export type { RecordActivityInput, RecordActivityOutput } from "../application/dto/record-activity.dto.js";
export type { GetFeedInput, GetFeedOutput } from "../application/dto/get-feed.dto.js";
export type { GetTimelineInput, GetTimelineOutput } from "../application/dto/get-timeline.dto.js";

export type { IActivityStore, ActivityFilters } from "../application/ports/activity-store.port.js";
export { ActivityEntry } from "../domain/entities/activity-entry.entity.js";
export { Actor } from "../domain/value-objects/actor.vo.js";
export { Action } from "../domain/value-objects/action.vo.js";
