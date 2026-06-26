export class InvalidAddress extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAddress";
  }

  static create(field: string): InvalidAddress {
    return new InvalidAddress(`${field} is required`);
  }
}
