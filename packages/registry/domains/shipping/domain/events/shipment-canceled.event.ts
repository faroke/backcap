export class ShipmentCanceled {
  public readonly shipmentId: string;
  public readonly reason: string;
  public readonly occurredAt: Date;

  constructor(shipmentId: string, reason: string, occurredAt: Date = new Date()) {
    this.shipmentId = shipmentId;
    this.reason = reason;
    this.occurredAt = occurredAt;
  }
}
