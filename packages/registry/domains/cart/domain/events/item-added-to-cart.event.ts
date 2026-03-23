export class ItemAddedToCart {
  public readonly cartId: string;
  public readonly variantId: string;
  public readonly quantity: number;
  public readonly occurredAt: Date;

  constructor(cartId: string, variantId: string, quantity: number, occurredAt: Date = new Date()) {
    this.cartId = cartId;
    this.variantId = variantId;
    this.quantity = quantity;
    this.occurredAt = occurredAt;
  }
}
