export class CartNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartNotFound";
  }

  static create(cartId: string): CartNotFound {
    return new CartNotFound(`Cart not found: "${cartId}"`);
  }
}
