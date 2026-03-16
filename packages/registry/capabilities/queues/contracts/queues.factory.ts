import type { IJobRepository } from "../application/ports/job-repository.port.js";
import type { IJobQueue } from "../application/ports/job-queue.port.js";
import { EnqueueJob } from "../application/use-cases/enqueue-job.use-case.js";
import { ProcessJob } from "../application/use-cases/process-job.use-case.js";
import { GetJobStatus } from "../application/use-cases/get-job-status.use-case.js";
import type { IQueuesService } from "./queues.contract.js";

export type QueuesServiceDeps = {
  jobRepository: IJobRepository;
  jobQueue: IJobQueue;
};

export function createQueuesService(deps: QueuesServiceDeps): IQueuesService {
  const enqueueJob = new EnqueueJob(deps.jobRepository);
  const processJob = new ProcessJob(deps.jobRepository);
  const getJobStatus = new GetJobStatus(deps.jobRepository);

  return {
    enqueue: (input) => enqueueJob.execute(input),
    process: (input) => processJob.execute(input),
    getStatus: (jobId) => getJobStatus.execute(jobId),
  };
}
