export class ConflictDetectionError extends Error {
  readonly filePath: string;
  readonly suggestion: string;
  override readonly cause?: unknown;

  constructor(message: string, filePath: string, suggestion: string, cause?: unknown) {
    super(message);
    this.name = "ConflictDetectionError";
    this.filePath = filePath;
    this.suggestion = suggestion;
    this.cause = cause;
  }
}
