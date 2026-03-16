export interface EnqueueJobInput {
  queue: string;
  payload: Record<string, unknown>;
  priority?: string;
  maxAttempts?: number;
}
