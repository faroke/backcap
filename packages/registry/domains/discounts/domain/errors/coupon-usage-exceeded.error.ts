export class CouponUsageExceeded extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CouponUsageExceeded";
  }

  static create(code: string): CouponUsageExceeded {
    return new CouponUsageExceeded(`Coupon usage limit exceeded: ${code}`);
  }
}
