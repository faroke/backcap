import type { Job } from "../../../domain/entities/job.entity.js";
import type { IJobRepository } from "../../ports/job-repository.port.js";

export class InMemoryJobRepository implements IJobRepository {
  private store = new Map<string, Job>();

  async save(job: Job): Promise<void> {
    this.store.set(job.id, job);
  }

  async findById(id: string): Promise<Job | null> {
    return this.store.get(id) ?? null;
  }

  async findByQueue(queue: string): Promise<Job[]> {
    return [...this.store.values()].filter((j) => j.queue === queue);
  }
}
