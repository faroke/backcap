export interface QueryAuditLogInput {
  actor?: string;
  action?: string;
  resource?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface QueryAuditLogEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface QueryAuditLogOutput {
  entries: QueryAuditLogEntry[];
  total: number;
}
