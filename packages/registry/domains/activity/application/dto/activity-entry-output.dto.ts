export interface ActivityEntryOutput {
  id: string;
  actor: { id: string; displayName: string };
  action: string;
  targetId: string;
  targetName: string;
  summary: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
}
