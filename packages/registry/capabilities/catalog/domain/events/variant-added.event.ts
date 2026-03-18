export class VariantAdded {
  public readonly productId: string;
  public readonly variantId: string;
  public readonly sku: string;
  public readonly occurredAt: Date;

  constructor(productId: string, variantId: string, sku: string, occurredAt: Date = new Date()) {
    this.productId = productId;
    this.variantId = variantId;
    this.sku = sku;
    this.occurredAt = occurredAt;
  }
}
