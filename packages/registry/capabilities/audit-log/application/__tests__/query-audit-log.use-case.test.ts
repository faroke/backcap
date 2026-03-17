import { describe, it, expect, beforeEach } from "vitest";
import { QueryAuditLog } from "../use-cases/query-audit-log.use-case.js";
import { InMemoryAuditStore } from "./mocks/in-memory-audit-store.mock.js";
import { createTestEntry } from "./fixtures/audit-entry.fixture.js";

describe("QueryAuditLog use case", () => {
  let auditStore: InMemoryAuditStore;
  let queryAuditLog: QueryAuditLog;

  beforeEach(async () => {
    auditStore = new InMemoryAuditStore();
    queryAuditLog = new QueryAuditLog(auditStore);

    // Seed entries
    await auditStore.append(
      createTestEntry({
        id: "entry-1",
        actor: "user-123",
        action: "USER.LOGIN",
        resource: "auth/session",
        timestamp: new Date("2025-01-01T10:00:00Z"),
      }),
    );
    await auditStore.append(
      createTestEntry({
        id: "entry-2",
        actor: "user-456",
        action: "USER.LOGOUT",
        resource: "auth/session",
        timestamp: new Date("2025-01-01T11:00:00Z"),
      }),
    );
    await auditStore.append(
      createTestEntry({
        id: "entry-3",
        actor: "user-123",
        action: "FEATURE_FLAG.TOGGLE",
        resource: "flags/dark-mode",
        timestamp: new Date("2025-01-02T10:00:00Z"),
      }),
    );
  });

  it("returns all entries when no filters provided", async () => {
    const result = await queryAuditLog.execute({});

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(3);
    expect(output.total).toBe(3);
  });

  it("filters by actor", async () => {
    const result = await queryAuditLog.execute({ actor: "user-123" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(2);
    expect(output.entries.every((e) => e.actor === "user-123")).toBe(true);
  });

  it("filters by action", async () => {
    const result = await queryAuditLog.execute({ action: "USER.LOGIN" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(1);
    expect(output.entries[0].action).toBe("USER.LOGIN");
  });

  it("filters by date range", async () => {
    const result = await queryAuditLog.execute({
      fromDate: new Date("2025-01-01T10:30:00Z"),
      toDate: new Date("2025-01-01T23:59:59Z"),
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(1);
    expect(output.entries[0].id).toBe("entry-2");
  });

  it("supports pagination with limit and offset", async () => {
    const result = await queryAuditLog.execute({ limit: 2, offset: 0 });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(2);
    expect(output.total).toBe(3);
  });

  it("supports pagination with offset", async () => {
    const result = await queryAuditLog.execute({ limit: 2, offset: 2 });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(1);
    expect(output.total).toBe(3);
  });

  it("returns empty result when no entries match", async () => {
    const result = await queryAuditLog.execute({ actor: "nonexistent-user" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(0);
    expect(output.total).toBe(0);
  });

  it("returns entries with correct shape", async () => {
    const result = await queryAuditLog.execute({ actor: "user-123" });
    const entry = result.unwrap().entries[0];

    expect(entry.id).toBeDefined();
    expect(entry.actor).toBe("user-123");
    expect(typeof entry.action).toBe("string");
    expect(entry.resource).toBeDefined();
    expect(entry.timestamp).toBeInstanceOf(Date);
  });
});
