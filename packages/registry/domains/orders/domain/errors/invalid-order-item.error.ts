export class InvalidOrderItem extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOrderItem";
  }

  static create(message: string): InvalidOrderItem {
    return new InvalidOrderItem(message);
  }
}
