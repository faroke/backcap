// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { JobCompleted } from "../../domain/events/job-completed.event.js";
import { JobFailed } from "../../domain/events/job-failed.event.js";
import { JobNotFound } from "../../domain/errors/job-not-found.error.js";
import type { IJobRepository } from "../ports/job-repository.port.js";
import type {
  ProcessJobInput,
  ProcessJobOutput,
} from "../dto/process-job.dto.js";

export class ProcessJob {
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly processHandler: (
      job: { type: string; payload: Record<string, unknown> },
    ) => Promise<Result<void, Error>>,
    private readonly maxAttempts: number = 3,
  ) {}

  async execute(
    input: ProcessJobInput,
  ): Promise<
    Result<
      ProcessJobOutput & { event: JobCompleted | JobFailed },
      Error
    >
  > {
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) {
      return Result.fail(JobNotFound.create(input.jobId));
    }

    const startResult = job.start(this.maxAttempts);
    if (startResult.isFail()) {
      return Result.fail(startResult.unwrapError());
    }

    await this.jobRepository.save(job);

    let handlerResult: Result<void, Error>;
    try {
      handlerResult = await this.processHandler({
        type: job.type,
        payload: job.payload.value,
      });
    } catch (err) {
      handlerResult = Result.fail(
        err instanceof Error ? err : new Error(String(err)),
      );
    }

    if (handlerResult.isOk()) {
      const completeResult = job.complete();
      if (completeResult.isFail()) {
        return Result.fail(completeResult.unwrapError());
      }
      await this.jobRepository.save(job);
      const completedAt = new Date();
      return Result.ok({
        status: "completed",
        completedAt,
        event: new JobCompleted(job.id, job.type, completedAt),
      });
    }

    const reason = handlerResult.unwrapError().message;
    const failResult = job.fail(reason);
    if (failResult.isFail()) {
      return Result.fail(failResult.unwrapError());
    }
    await this.jobRepository.save(job);
    return Result.ok({
      status: "failed",
      completedAt: null,
      event: new JobFailed(job.id, job.type, reason, job.attempts),
    });
  }
}
