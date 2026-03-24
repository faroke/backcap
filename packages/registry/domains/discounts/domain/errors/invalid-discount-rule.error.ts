export class InvalidDiscountRule extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDiscountRule";
  }

  static create(reason: string): InvalidDiscountRule {
    return new InvalidDiscountRule(`Invalid discount rule: ${reason}`);
  }
}
