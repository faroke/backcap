export class InvalidStockQuantity extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStockQuantity";
  }

  static create(reason: string): InvalidStockQuantity {
    return new InvalidStockQuantity(`Invalid stock quantity: ${reason}`);
  }
}
