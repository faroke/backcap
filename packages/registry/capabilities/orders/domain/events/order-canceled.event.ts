export class OrderCanceled {
  public readonly orderId: string;
  public readonly occurredAt: Date;

  constructor(orderId: string, occurredAt: Date = new Date()) {
    this.orderId = orderId;
    this.occurredAt = occurredAt;
  }
}
