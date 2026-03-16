import type { Result } from "../shared/result.js";
import type { RecordEntryInput, RecordEntryOutput } from "../application/dto/record-entry.dto.js";
import type { QueryAuditLogInput, QueryAuditLogOutput } from "../application/dto/query-audit-log.dto.js";

export interface IAuditLogService {
  record(input: RecordEntryInput): Promise<Result<RecordEntryOutput, Error>>;
  query(input: QueryAuditLogInput): Promise<Result<QueryAuditLogOutput, Error>>;
}
