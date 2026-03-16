// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { Job } from "../../domain/entities/job.entity.js";
import { JobPriority } from "../../domain/value-objects/job-priority.vo.js";
import type { IJobRepository } from "../ports/job-repository.port.js";
import type { EnqueueJobInput } from "../dto/enqueue-job-input.dto.js";
import type { EnqueueJobOutput } from "../dto/enqueue-job-output.dto.js";

export class EnqueueJob {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(
    input: EnqueueJobInput,
  ): Promise<Result<EnqueueJobOutput, Error>> {
    if (input.priority !== undefined) {
      const priorityResult = JobPriority.create(input.priority);
      if (priorityResult.isFail()) {
        return Result.fail(priorityResult.unwrapError());
      }
    }

    const id = crypto.randomUUID();
    const jobResult = Job.create({
      id,
      queue: input.queue,
      payload: input.payload,
      maxAttempts: input.maxAttempts,
    });

    const job = jobResult.unwrap();
    await this.jobRepository.save(job);

    return Result.ok({ jobId: job.id });
  }
}
