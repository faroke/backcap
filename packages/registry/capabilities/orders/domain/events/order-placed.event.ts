export class OrderPlaced {
  public readonly orderId: string;
  public readonly totalCents: number;
  public readonly itemCount: number;
  public readonly occurredAt: Date;

  constructor(orderId: string, totalCents: number, itemCount: number, occurredAt: Date = new Date()) {
    this.orderId = orderId;
    this.totalCents = totalCents;
    this.itemCount = itemCount;
    this.occurredAt = occurredAt;
  }
}
