import type { IQueueProvider } from "../../ports/queue-provider.port.js";

export class InMemoryQueueProvider implements IQueueProvider {
  private queues = new Map<
    string,
    Array<{ jobId: string; payload: Record<string, unknown> }>
  >();

  async enqueue(
    type: string,
    payload: Record<string, unknown>,
    scheduledAt?: Date,
  ): Promise<{ jobId: string }> {
    const jobId = crypto.randomUUID();
    const queue = this.queues.get(type) ?? [];
    queue.push({ jobId, payload });
    this.queues.set(type, queue);
    return { jobId };
  }

  async dequeue(
    type: string,
  ): Promise<{ jobId: string; payload: Record<string, unknown> } | undefined> {
    const queue = this.queues.get(type);
    if (!queue || queue.length === 0) {
      return undefined;
    }
    return queue.shift();
  }
}
