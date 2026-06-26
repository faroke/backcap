export class StockAlreadyExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StockAlreadyExists";
  }

  static create(sku: string, warehouseId: string): StockAlreadyExists {
    return new StockAlreadyExists(
      `Stock already exists for SKU "${sku}" in warehouse "${warehouseId}"`,
    );
  }
}
