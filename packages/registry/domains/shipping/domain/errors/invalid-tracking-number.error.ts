export class InvalidTrackingNumber extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTrackingNumber";
  }
  static create(value: string): InvalidTrackingNumber {
    return new InvalidTrackingNumber(`Invalid tracking number: "${value}"`);
  }
  static empty(): InvalidTrackingNumber {
    return new InvalidTrackingNumber("Tracking number cannot be empty");
  }
  static invalidFormat(value: string): InvalidTrackingNumber {
    return new InvalidTrackingNumber(`Invalid tracking number format: "${value}"`);
  }
  static invalidLength(value: string): InvalidTrackingNumber {
    return new InvalidTrackingNumber(`Tracking number must be between 6 and 40 characters: "${value}"`);
  }
}
