export class CouponExpired extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CouponExpired";
  }

  static create(code: string): CouponExpired {
    return new CouponExpired(`Coupon has expired: ${code}`);
  }
}
