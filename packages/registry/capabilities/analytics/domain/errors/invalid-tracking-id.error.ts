export class InvalidTrackingId extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTrackingId";
  }

  static create(value: string): InvalidTrackingId {
    return new InvalidTrackingId(
      `Invalid tracking ID: "${value}". Must be a non-empty alphanumeric string of 8–64 characters.`,
    );
  }
}
