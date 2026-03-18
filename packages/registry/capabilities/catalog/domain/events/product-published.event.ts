export class ProductPublished {
  public readonly productId: string;
  public readonly occurredAt: Date;

  constructor(productId: string, occurredAt: Date = new Date()) {
    this.productId = productId;
    this.occurredAt = occurredAt;
  }
}
