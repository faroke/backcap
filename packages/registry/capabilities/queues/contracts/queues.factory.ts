import type { IJobRepository } from "../application/ports/job-repository.port.js";
import type { Result } from "../shared/result.js";
import { EnqueueJob } from "../application/use-cases/enqueue-job.use-case.js";
import { ProcessJob } from "../application/use-cases/process-job.use-case.js";
import { GetJobStatus } from "../application/use-cases/get-job-status.use-case.js";
import type { IQueuesService } from "./queues.contract.js";

export type QueuesDeps = {
  jobRepository: IJobRepository;
  processHandler: (
    job: { type: string; payload: Record<string, unknown> },
  ) => Promise<Result<void, Error>>;
  maxAttempts?: number;
};

export function createQueuesCapability(deps: QueuesDeps): IQueuesService {
  const enqueueJob = new EnqueueJob(deps.jobRepository);
  const processJob = new ProcessJob(deps.jobRepository, deps.processHandler, deps.maxAttempts);
  const getJobStatus = new GetJobStatus(deps.jobRepository);

  return {
    enqueue: (input) => enqueueJob.execute(input),
    process: (input) => processJob.execute(input),
    getStatus: (input) => getJobStatus.execute(input),
  };
}
