export class PromotionCreated {
  public readonly promotionId: string;
  public readonly name: string;
  public readonly occurredAt: Date;

  constructor(promotionId: string, name: string, occurredAt: Date = new Date()) {
    this.promotionId = promotionId;
    this.name = name;
    this.occurredAt = occurredAt;
  }
}
