export class ShipmentDelivered {
  public readonly shipmentId: string;
  public readonly deliveredAt: Date;
  public readonly occurredAt: Date;

  constructor(shipmentId: string, deliveredAt: Date, occurredAt: Date = new Date()) {
    this.shipmentId = shipmentId;
    this.deliveredAt = deliveredAt;
    this.occurredAt = occurredAt;
  }
}
