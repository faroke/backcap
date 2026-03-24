import type { ActivityEntryOutput } from "./activity-entry-output.dto.js";

export interface GetFeedInput {
  actorId?: string;
  action?: string;
  targetId?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface GetFeedOutput {
  entries: ActivityEntryOutput[];
  total: number;
}
