import type { ActivityEntryOutput } from "./activity-entry-output.dto.js";

export interface GetTimelineInput {
  actorId: string;
  action?: string;
  targetId?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface GetTimelineOutput {
  entries: ActivityEntryOutput[];
  total: number;
}
