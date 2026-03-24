export class CouponNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CouponNotFound";
  }

  static create(code: string): CouponNotFound {
    return new CouponNotFound(`Coupon not found: ${code}`);
  }
}
