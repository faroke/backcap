export class InvalidUsageLimit extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUsageLimit";
  }

  static create(reason: string): InvalidUsageLimit {
    return new InvalidUsageLimit(reason);
  }
}
