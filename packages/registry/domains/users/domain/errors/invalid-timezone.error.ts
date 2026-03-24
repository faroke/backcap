export class InvalidTimezone extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTimezone";
  }

  static create(value: string): InvalidTimezone {
    return new InvalidTimezone(`Invalid timezone: "${value}"`);
  }
}
