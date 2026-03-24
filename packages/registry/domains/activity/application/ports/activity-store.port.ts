import type { ActivityEntry } from "../../domain/entities/activity-entry.entity.js";

export interface ActivityFilters {
  actorId?: string;
  action?: string;
  targetId?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface IActivityStore {
  append(entry: ActivityEntry): Promise<void>;
  query(filters: ActivityFilters): Promise<{ entries: ActivityEntry[]; total: number }>;
}
