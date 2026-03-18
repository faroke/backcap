export class InvalidOrderTransition extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOrderTransition";
  }

  static create(from: string, to: string): InvalidOrderTransition {
    return new InvalidOrderTransition(`Invalid order transition: "${from}" → "${to}"`);
  }
}
