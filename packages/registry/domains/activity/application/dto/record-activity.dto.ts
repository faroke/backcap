export interface RecordActivityInput {
  actor: { id: string; displayName: string };
  action: string;
  targetId: string;
  targetName: string;
  metadata?: Record<string, unknown>;
}

export interface RecordActivityOutput {
  entryId: string;
  occurredAt: Date;
}
