export class ProductCreated {
  public readonly productId: string;
  public readonly name: string;
  public readonly occurredAt: Date;

  constructor(productId: string, name: string, occurredAt: Date = new Date()) {
    this.productId = productId;
    this.name = name;
    this.occurredAt = occurredAt;
  }
}
