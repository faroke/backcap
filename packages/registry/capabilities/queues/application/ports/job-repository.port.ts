import type { Job } from "../../domain/entities/job.entity.js";

export interface IJobRepository {
  findById(id: string): Promise<Job | null>;
  findByQueue(queue: string): Promise<Job[]>;
  save(job: Job): Promise<void>;
}
