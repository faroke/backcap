export class JobNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JobNotFound";
  }

  static create(jobId: string): JobNotFound {
    return new JobNotFound(`Job not found with id: "${jobId}"`);
  }
}
