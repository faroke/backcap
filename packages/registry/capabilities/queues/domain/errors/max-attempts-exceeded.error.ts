export class MaxAttemptsExceeded extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaxAttemptsExceeded";
  }

  static create(jobId: string, maxAttempts: number): MaxAttemptsExceeded {
    return new MaxAttemptsExceeded(
      `Job "${jobId}" has exceeded the maximum of ${maxAttempts} attempts`,
    );
  }
}
