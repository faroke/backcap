export class InvalidTrackingNumber extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTrackingNumber";
  }
  static create(value: string): InvalidTrackingNumber {
    return new InvalidTrackingNumber(`Invalid tracking number: "${value}"`);
  }
}
