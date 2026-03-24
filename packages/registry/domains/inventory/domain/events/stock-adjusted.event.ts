export class StockAdjusted {
  public readonly sku: string;
  public readonly warehouseId: string;
  public readonly previousQuantity: number;
  public readonly newQuantity: number;
  public readonly reason: string;
  public readonly occurredAt: Date;

  constructor(
    sku: string,
    warehouseId: string,
    previousQuantity: number,
    newQuantity: number,
    reason: string,
    occurredAt: Date = new Date(),
  ) {
    this.sku = sku;
    this.warehouseId = warehouseId;
    this.previousQuantity = previousQuantity;
    this.newQuantity = newQuantity;
    this.reason = reason;
    this.occurredAt = occurredAt;
  }
}
