export class ProcessingFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProcessingFailed";
  }

  static create(fileId: string, reason: string): ProcessingFailed {
    return new ProcessingFailed(`File processing failed for "${fileId}": ${reason}`);
  }
}
