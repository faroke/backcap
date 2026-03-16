export interface IJobQueue {
  enqueue(params: {
    queue: string;
    payload: Record<string, unknown>;
    priority?: string;
  }): Promise<string>;
  dequeue(queue: string): Promise<string | null>;
}
