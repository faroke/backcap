import type { AuditEntry } from "../../../domain/entities/audit-entry.entity.js";
import type { IAuditStore, AuditFilters } from "../../ports/audit-store.port.js";

export class InMemoryAuditStore implements IAuditStore {
  private store: AuditEntry[] = [];

  async append(entry: AuditEntry): Promise<void> {
    this.store.push(entry);
  }

  async query(
    filters: AuditFilters,
  ): Promise<{ entries: AuditEntry[]; total: number }> {
    let entries = [...this.store];

    if (filters.actor) {
      entries = entries.filter((e) => e.actor === filters.actor);
    }

    if (filters.action) {
      entries = entries.filter((e) => e.action.value === filters.action);
    }

    if (filters.resource) {
      entries = entries.filter((e) => e.resource === filters.resource);
    }

    if (filters.fromDate) {
      entries = entries.filter((e) => e.timestamp >= filters.fromDate!);
    }

    if (filters.toDate) {
      entries = entries.filter((e) => e.timestamp <= filters.toDate!);
    }

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
