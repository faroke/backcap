export class InvalidCartItem extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCartItem";
  }

  static create(reason: string): InvalidCartItem {
    return new InvalidCartItem(reason);
  }
}
