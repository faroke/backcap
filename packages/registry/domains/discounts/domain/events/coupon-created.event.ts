export class CouponCreated {
  public readonly couponId: string;
  public readonly code: string;
  public readonly promotionId: string;
  public readonly occurredAt: Date;

  constructor(couponId: string, code: string, promotionId: string, occurredAt: Date = new Date()) {
    this.couponId = couponId;
    this.code = code;
    this.promotionId = promotionId;
    this.occurredAt = occurredAt;
  }
}
