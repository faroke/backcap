export class StockNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StockNotFound";
  }

  static create(sku: string, warehouseId: string): StockNotFound {
    return new StockNotFound(
      `Stock not found for SKU "${sku}" in warehouse "${warehouseId}"`,
    );
  }
}
