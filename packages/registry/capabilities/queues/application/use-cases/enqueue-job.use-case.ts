// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { Job } from "../../domain/entities/job.entity.js";
import type { IJobRepository } from "../ports/job-repository.port.js";
import type {
  EnqueueJobInput,
  EnqueueJobOutput,
} from "../dto/enqueue-job.dto.js";

export class EnqueueJob {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(
    input: EnqueueJobInput,
  ): Promise<Result<EnqueueJobOutput, Error>> {
    const id = crypto.randomUUID();
    const jobResult = Job.create({
      id,
      type: input.type,
      payload: input.payload,
      scheduledAt: input.scheduledAt,
    });

    if (jobResult.isFail()) {
      return Result.fail(jobResult.unwrapError());
    }

    const job = jobResult.unwrap();
    await this.jobRepository.save(job);

    return Result.ok({ jobId: job.id, scheduledAt: job.scheduledAt });
  }
}
