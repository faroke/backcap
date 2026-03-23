import type { AuditEntry } from "../../domain/entities/audit-entry.entity.js";

export interface AuditFilters {
  actor?: string;
  action?: string;
  resource?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface IAuditStore {
  append(entry: AuditEntry): Promise<void>;
  query(filters: AuditFilters): Promise<{ entries: AuditEntry[]; total: number }>;
}
