export class LowStockAlert {
  public readonly sku: string;
  public readonly warehouseId: string;
  public readonly available: number;
  public readonly threshold: number;
  public readonly occurredAt: Date;

  constructor(
    sku: string,
    warehouseId: string,
    available: number,
    threshold: number,
    occurredAt: Date = new Date(),
  ) {
    this.sku = sku;
    this.warehouseId = warehouseId;
    this.available = available;
    this.threshold = threshold;
    this.occurredAt = occurredAt;
  }
}
