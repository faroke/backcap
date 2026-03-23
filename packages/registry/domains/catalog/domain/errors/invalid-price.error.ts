export class InvalidPrice extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPrice";
  }

  static create(reason: string): InvalidPrice {
    return new InvalidPrice(`Invalid price: ${reason}`);
  }
}
