export class CartConverted {
  public readonly cartId: string;
  public readonly occurredAt: Date;

  constructor(cartId: string, occurredAt: Date = new Date()) {
    this.cartId = cartId;
    this.occurredAt = occurredAt;
  }
}
