import { Result } from "../shared/result.js";
import type { IAuditStore } from "../application/ports/audit-store.port.js";
import { RecordEntry } from "../application/use-cases/record-entry.use-case.js";
import { QueryAuditLog } from "../application/use-cases/query-audit-log.use-case.js";
import type { IAuditLogService } from "./audit-log.contract.js";

export type AuditLogServiceDeps = {
  auditStore: IAuditStore;
};

export function createAuditLogCapability(
  deps: AuditLogServiceDeps,
): IAuditLogService {
  const recordEntry = new RecordEntry(deps.auditStore);
  const queryAuditLog = new QueryAuditLog(deps.auditStore);

  return {
    record: async (input) => {
      const result = await recordEntry.execute(input);
      if (result.isFail()) {
        return result;
      }
      const { output } = result.unwrap();
      return Result.ok(output);
    },
    query: (input) => queryAuditLog.execute(input),
  };
}
