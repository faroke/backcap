// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { JobNotFound } from "../../domain/errors/job-not-found.error.js";
import type { IJobRepository } from "../ports/job-repository.port.js";
import type { GetJobStatusOutput } from "../dto/get-job-status-output.dto.js";

export class GetJobStatus {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(jobId: string): Promise<Result<GetJobStatusOutput, Error>> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      return Result.fail(JobNotFound.create(jobId));
    }

    return Result.ok({
      id: job.id,
      queue: job.queue,
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      createdAt: job.createdAt,
      processedAt: job.processedAt,
    });
  }
}
