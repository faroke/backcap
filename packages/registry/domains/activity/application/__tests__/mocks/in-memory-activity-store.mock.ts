import type { ActivityEntry } from "../../../domain/entities/activity-entry.entity.js";
import type { IActivityStore, ActivityFilters } from "../../ports/activity-store.port.js";

export class InMemoryActivityStore implements IActivityStore {
  private store: ActivityEntry[] = [];

  async append(entry: ActivityEntry): Promise<void> {
    this.store.push(entry);
  }

  async query(
    filters: ActivityFilters,
  ): Promise<{ entries: ActivityEntry[]; total: number }> {
    let entries = [...this.store];

    if (filters.actorId) {
      entries = entries.filter((e) => e.actor.id === filters.actorId);
    }

    if (filters.action) {
      entries = entries.filter((e) => e.action.value === filters.action);
    }

    if (filters.targetId) {
      entries = entries.filter((e) => e.targetId === filters.targetId);
    }

    if (filters.fromDate) {
      entries = entries.filter((e) => e.occurredAt >= filters.fromDate!);
    }

    if (filters.toDate) {
      entries = entries.filter((e) => e.occurredAt <= filters.toDate!);
    }

    // Sort by most recent first (activity feeds are reverse-chronological)
    entries.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    const total = entries.length;

    if (filters.offset) {
      entries = entries.slice(filters.offset);
    }

    if (filters.limit) {
      entries = entries.slice(0, filters.limit);
    }

    return { entries, total };
  }
}
