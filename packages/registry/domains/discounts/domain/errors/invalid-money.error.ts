export class InvalidMoney extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMoney";
  }

  static create(reason: string): InvalidMoney {
    return new InvalidMoney(reason);
  }
}
