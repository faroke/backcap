export class InvalidOrder extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOrder";
  }

  static create(message: string): InvalidOrder {
    return new InvalidOrder(message);
  }
}
