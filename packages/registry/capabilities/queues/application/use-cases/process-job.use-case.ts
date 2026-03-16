// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { JobCompleted } from "../../domain/events/job-completed.event.js";
import { JobFailed } from "../../domain/events/job-failed.event.js";
import { JobNotFound } from "../../domain/errors/job-not-found.error.js";
import type { IJobRepository } from "../ports/job-repository.port.js";
import type { ProcessJobInput } from "../dto/process-job-input.dto.js";
import type { ProcessJobOutput } from "../dto/process-job-output.dto.js";

export class ProcessJob {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(
    input: ProcessJobInput,
  ): Promise<Result<ProcessJobOutput & { event: JobCompleted | JobFailed }, Error>> {
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) {
      return Result.fail(JobNotFound.create(input.jobId));
    }

    const processingResult = job.markProcessing();
    if (processingResult.isFail()) {
      return Result.fail(processingResult.unwrapError());
    }

    const processingJob = processingResult.unwrap();
    await this.jobRepository.save(processingJob);

    try {
      await input.handler(processingJob.payload);
      const completedJob = processingJob.markCompleted();
      await this.jobRepository.save(completedJob);
      return Result.ok({
        jobId: completedJob.id,
        status: "completed",
        event: new JobCompleted(completedJob.id, completedJob.queue),
      });
    } catch (err) {
      const failedJob = processingJob.markFailed();
      await this.jobRepository.save(failedJob);
      const reason = err instanceof Error ? err.message : String(err);
      return Result.ok({
        jobId: failedJob.id,
        status: "failed",
        event: new JobFailed(failedJob.id, failedJob.queue, reason),
      });
    }
  }
}
