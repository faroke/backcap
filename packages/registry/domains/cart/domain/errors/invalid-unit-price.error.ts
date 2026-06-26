export class InvalidUnitPrice extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUnitPrice";
  }

  static create(): InvalidUnitPrice {
    return new InvalidUnitPrice(
      "Unit price must be a non-negative integer (cents) up to 99999999999",
    );
  }
}
