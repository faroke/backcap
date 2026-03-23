export class InvalidJobPayload extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidJobPayload";
  }

  static create(reason: string): InvalidJobPayload {
    return new InvalidJobPayload(`Invalid job payload: ${reason}`);
  }
}
