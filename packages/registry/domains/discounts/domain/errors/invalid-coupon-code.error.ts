export class InvalidCouponCode extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCouponCode";
  }

  static create(reason: string): InvalidCouponCode {
    return new InvalidCouponCode(reason);
  }
}
