import { AuditEntry } from "../../../domain/entities/audit-entry.entity.js";

export function createTestEntry(
  overrides?: Partial<{
    id: string;
    actor: string;
    action: string;
    resource: string;
    metadata: Record<string, unknown>;
    timestamp: Date;
  }>,
): AuditEntry {
  const result = AuditEntry.create({
    id: overrides?.id ?? "test-entry-1",
    actor: overrides?.actor ?? "user-123",
    action: overrides?.action ?? "USER.LOGIN",
    resource: overrides?.resource ?? "auth/session",
    metadata: overrides?.metadata,
    timestamp: overrides?.timestamp,
  });

  if (result.isFail()) {
    throw new Error(
      `Failed to create test audit entry: ${result.unwrapError().message}`,
    );
  }

  return result.unwrap();
}
