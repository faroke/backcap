export interface RecordEntryInput {
  actor: string;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
}

export interface RecordEntryOutput {
  entryId: string;
  timestamp: Date;
}
