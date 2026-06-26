export class InvalidMediaPurpose extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMediaPurpose";
  }

  static create(value: string, validValues: string[]): InvalidMediaPurpose {
    return new InvalidMediaPurpose(
      `Invalid media purpose: "${value}". Valid values: ${validValues.join(", ")}`,
    );
  }
}
