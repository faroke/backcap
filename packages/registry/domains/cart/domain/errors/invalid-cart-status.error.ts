export class InvalidCartStatus extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCartStatus";
  }

  static create(value: string): InvalidCartStatus {
    return new InvalidCartStatus(`Invalid cart status: "${value}"`);
  }
}
