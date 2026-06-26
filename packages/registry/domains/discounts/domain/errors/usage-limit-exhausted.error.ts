export class UsageLimitExhausted extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsageLimitExhausted";
  }

  static create(): UsageLimitExhausted {
    return new UsageLimitExhausted("Usage limit exhausted");
  }
}
