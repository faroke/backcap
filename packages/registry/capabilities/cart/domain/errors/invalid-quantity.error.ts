export class InvalidQuantity extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidQuantity";
  }

  static create(reason: string): InvalidQuantity {
    return new InvalidQuantity(`Invalid quantity: ${reason}`);
  }
}
