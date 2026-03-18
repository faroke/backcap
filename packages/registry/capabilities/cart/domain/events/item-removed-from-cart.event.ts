export class ItemRemovedFromCart {
  public readonly cartId: string;
  public readonly variantId: string;
  public readonly occurredAt: Date;

  constructor(cartId: string, variantId: string, occurredAt: Date = new Date()) {
    this.cartId = cartId;
    this.variantId = variantId;
    this.occurredAt = occurredAt;
  }
}
