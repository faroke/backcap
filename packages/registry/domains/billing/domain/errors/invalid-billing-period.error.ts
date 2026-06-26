export class InvalidBillingPeriod extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidBillingPeriod";
  }

  static create(): InvalidBillingPeriod {
    return new InvalidBillingPeriod("End date must be after start date");
  }
}
