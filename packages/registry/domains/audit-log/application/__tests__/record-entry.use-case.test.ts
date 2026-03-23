import { describe, it, expect, beforeEach } from "vitest";
import { RecordEntry } from "../use-cases/record-entry.use-case.js";
import { InMemoryAuditStore } from "./mocks/in-memory-audit-store.mock.js";
import { InvalidAuditAction } from "../../domain/errors/invalid-audit-action.error.js";
import { EntryRecorded } from "../../domain/events/entry-recorded.event.js";

describe("RecordEntry use case", () => {
  let auditStore: InMemoryAuditStore;
  let recordEntry: RecordEntry;

  beforeEach(() => {
    auditStore = new InMemoryAuditStore();
    recordEntry = new RecordEntry(auditStore);
  });

  it("records a valid audit entry", async () => {
    const result = await recordEntry.execute({
      actor: "user-123",
      action: "USER.LOGIN",
      resource: "auth/session",
    });

    expect(result.isOk()).toBe(true);
    const { output, event } = result.unwrap();
    expect(output.entryId).toBeDefined();
    expect(output.timestamp).toBeInstanceOf(Date);
    expect(event).toBeInstanceOf(EntryRecorded);
    expect(event.actor).toBe("user-123");
    expect(event.action).toBe("USER.LOGIN");
    expect(event.resource).toBe("auth/session");
  });

  it("records entry with metadata", async () => {
    const result = await recordEntry.execute({
      actor: "user-123",
      action: "USER.LOGIN",
      resource: "auth/session",
      metadata: { ip: "127.0.0.1" },
    });

    expect(result.isOk()).toBe(true);
  });

  it("fails with invalid action format", async () => {
    const result = await recordEntry.execute({
      actor: "user-123",
      action: "invalid-action",
      resource: "auth/session",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAuditAction);
  });
});
