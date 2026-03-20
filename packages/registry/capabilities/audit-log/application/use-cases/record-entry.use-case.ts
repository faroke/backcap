import { Result } from "../../shared/result.js";
import { AuditEntry } from "../../domain/entities/audit-entry.entity.js";
import { EntryRecorded } from "../../domain/events/entry-recorded.event.js";
import type { IAuditStore } from "../ports/audit-store.port.js";
import type { RecordEntryInput } from "../dto/record-entry.dto.js";
import type { RecordEntryOutput } from "../dto/record-entry.dto.js";

export class RecordEntry {
  constructor(private readonly auditStore: IAuditStore) {}

  async execute(
    input: RecordEntryInput,
  ): Promise<Result<{ output: RecordEntryOutput; event: EntryRecorded }, Error>> {
    const id = crypto.randomUUID();
    const entryResult = AuditEntry.create({
      id,
      actor: input.actor,
      action: input.action,
      resource: input.resource,
      metadata: input.metadata,
    });

    if (entryResult.isFail()) {
      return Result.fail(entryResult.unwrapError());
    }

    const entry = entryResult.unwrap();
    await this.auditStore.append(entry);

    const event = new EntryRecorded(
      entry.id,
      entry.actor,
      entry.action.value,
      entry.resource,
    );

    return Result.ok({
      output: {
        entryId: entry.id,
        timestamp: entry.timestamp,
      },
      event,
    });
  }
}
