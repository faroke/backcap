export class InsufficientStock extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientStock";
  }

  static create(sku: string, requested: number, available: number): InsufficientStock {
    return new InsufficientStock(
      `Insufficient stock for SKU "${sku}": requested ${requested}, available ${available}`,
    );
  }
}
