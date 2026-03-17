// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { JobNotFound } from "../../domain/errors/job-not-found.error.js";
import type { IJobRepository } from "../ports/job-repository.port.js";
import type {
  GetJobStatusInput,
  GetJobStatusOutput,
} from "../dto/get-job-status.dto.js";

export class GetJobStatus {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(
    input: GetJobStatusInput,
  ): Promise<Result<GetJobStatusOutput, Error>> {
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) {
      return Result.fail(JobNotFound.create(input.jobId));
    }

    return Result.ok({
      id: job.id,
      type: job.type,
      payload: job.payload.value,
      status: job.status,
      attempts: job.attempts,
      scheduledAt: job.scheduledAt,
      createdAt: job.createdAt,
      failureReason: job.failureReason,
    });
  }
}
