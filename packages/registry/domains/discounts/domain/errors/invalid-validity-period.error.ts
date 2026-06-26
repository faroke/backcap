export class InvalidValidityPeriod extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidValidityPeriod";
  }

  static create(reason: string): InvalidValidityPeriod {
    return new InvalidValidityPeriod(reason);
  }
}
