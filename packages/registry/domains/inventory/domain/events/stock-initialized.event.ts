export class StockInitialized {
  public readonly sku: string;
  public readonly warehouseId: string;
  public readonly quantity: number;
  public readonly occurredAt: Date;

  constructor(sku: string, warehouseId: string, quantity: number, occurredAt: Date = new Date()) {
    this.sku = sku;
    this.warehouseId = warehouseId;
    this.quantity = quantity;
    this.occurredAt = occurredAt;
  }
}
