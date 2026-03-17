import type { Job } from "../../domain/entities/job.entity.js";

export interface IJobRepository {
  save(job: Job): Promise<void>;
  findById(id: string): Promise<Job | undefined>;
  findPending(type: string): Promise<Job[]>;
}
