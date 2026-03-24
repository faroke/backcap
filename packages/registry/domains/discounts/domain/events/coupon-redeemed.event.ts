export class CouponRedeemed {
  public readonly couponId: string;
  public readonly code: string;
  public readonly promotionId: string;
  public readonly customerId: string;
  public readonly discountAmountCents: number;
  public readonly currency: string;
  public readonly occurredAt: Date;

  constructor(
    couponId: string,
    code: string,
    promotionId: string,
    customerId: string,
    discountAmountCents: number,
    currency: string,
    occurredAt: Date = new Date(),
  ) {
    this.couponId = couponId;
    this.code = code;
    this.promotionId = promotionId;
    this.customerId = customerId;
    this.discountAmountCents = discountAmountCents;
    this.currency = currency;
    this.occurredAt = occurredAt;
  }
}
