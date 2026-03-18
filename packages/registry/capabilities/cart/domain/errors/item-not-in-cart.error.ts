export class ItemNotInCart extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItemNotInCart";
  }

  static create(variantId: string): ItemNotInCart {
    return new ItemNotInCart(`Item not in cart: variant "${variantId}"`);
  }
}
