export class InvalidCartId extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCartId";
  }

  static create(): InvalidCartId {
    return new InvalidCartId("Cart ID is required");
  }
}
