export class PromotionActivated {
  public readonly promotionId: string;
  public readonly occurredAt: Date;

  constructor(promotionId: string, occurredAt: Date = new Date()) {
    this.promotionId = promotionId;
    this.occurredAt = occurredAt;
  }
}
