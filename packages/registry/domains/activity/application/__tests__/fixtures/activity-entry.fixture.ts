import { ActivityEntry } from "../../../domain/entities/activity-entry.entity.js";

export function createTestActivityEntry(
  overrides?: Partial<{
    id: string;
    actor: { id: string; displayName: string };
    action: string;
    targetId: string;
    targetName: string;
    metadata: Record<string, unknown>;
    occurredAt: Date;
  }>,
): ActivityEntry {
  const result = ActivityEntry.create({
    id: overrides?.id ?? "activity-1",
    actor: overrides?.actor ?? { id: "user-123", displayName: "Marie" },
    action: overrides?.action ?? "invited",
    targetId: overrides?.targetId ?? "project-456",
    targetName: overrides?.targetName ?? "Project Alpha",
    metadata: overrides?.metadata,
    occurredAt: overrides?.occurredAt,
  });

  if (result.isFail()) {
    throw new Error(
      `Failed to create test activity entry: ${result.unwrapError().message}`,
    );
  }

  return result.unwrap();
}
