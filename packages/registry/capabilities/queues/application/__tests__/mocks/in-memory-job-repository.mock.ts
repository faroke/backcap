import type { Job } from "../../../domain/entities/job.entity.js";
import type { IJobRepository } from "../../ports/job-repository.port.js";

export class InMemoryJobRepository implements IJobRepository {
  private store = new Map<string, Job>();

  async save(job: Job): Promise<void> {
    this.store.set(job.id, job);
  }

  async findById(id: string): Promise<Job | undefined> {
    return this.store.get(id);
  }

  async findPending(type: string): Promise<Job[]> {
    return [...this.store.values()].filter(
      (j) => j.type === type && j.status === "pending",
    );
  }
}
