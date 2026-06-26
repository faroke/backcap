import type { ActivityEntry } from "../../domain/entities/activity-entry.entity.js";

export interface ActivityFilters {
  actorId?: string | undefined;
  action?: string | undefined;
  targetId?: string | undefined;
  fromDate?: Date | undefined;
  toDate?: Date | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface IActivityStore {
  append(entry: ActivityEntry): Promise<void>;
  query(filters: ActivityFilters): Promise<{ entries: ActivityEntry[]; total: number }>;
}
