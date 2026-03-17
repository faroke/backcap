export interface IQueueProvider {
  enqueue(
    type: string,
    payload: Record<string, unknown>,
    scheduledAt?: Date,
  ): Promise<{ jobId: string }>;
  dequeue(
    type: string,
  ): Promise<{ jobId: string; payload: Record<string, unknown> } | undefined>;
}
