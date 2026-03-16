export class InvalidTrackingId extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTrackingId";
  }

  static create(trackingId: string): InvalidTrackingId {
    return new InvalidTrackingId(
      `Invalid tracking ID: "${trackingId}". Must be alphanumeric, 8-64 characters.`,
    );
  }
}
