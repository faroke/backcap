export class ProcessingFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProcessingFailed";
  }

  static create(mediaId: string, reason: string): ProcessingFailed {
    return new ProcessingFailed(`Media processing failed for "${mediaId}": ${reason}`);
  }
}
