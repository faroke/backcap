export class InvalidAddress extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAddress";
  }

  static create(reason: string): InvalidAddress {
    return new InvalidAddress(`Invalid address: ${reason}`);
  }
}
