import type { AuditEntry } from "../../domain/entities/audit-entry.entity.js";

export interface AuditFilters {
  actor?: string | undefined;
  action?: string | undefined;
  resource?: string | undefined;
  fromDate?: Date | undefined;
  toDate?: Date | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface IAuditStore {
  append(entry: AuditEntry): Promise<void>;
  query(filters: AuditFilters): Promise<{ entries: AuditEntry[]; total: number }>;
}
