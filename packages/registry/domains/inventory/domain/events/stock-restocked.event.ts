export class StockRestocked {
  public readonly sku: string;
  public readonly warehouseId: string;
  public readonly addedQuantity: number;
  public readonly newTotal: number;
  public readonly occurredAt: Date;

  constructor(
    sku: string,
    warehouseId: string,
    addedQuantity: number,
    newTotal: number,
    occurredAt: Date = new Date(),
  ) {
    this.sku = sku;
    this.warehouseId = warehouseId;
    this.addedQuantity = addedQuantity;
    this.newTotal = newTotal;
    this.occurredAt = occurredAt;
  }
}
