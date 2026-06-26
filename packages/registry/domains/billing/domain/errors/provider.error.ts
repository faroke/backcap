export class ProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderError";
  }

  static create(message: string): ProviderError {
    return new ProviderError(message);
  }
}
