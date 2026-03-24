export class ShipmentInTransit {
  public readonly shipmentId: string;
  public readonly occurredAt: Date;

  constructor(shipmentId: string, occurredAt: Date = new Date()) {
    this.shipmentId = shipmentId;
    this.occurredAt = occurredAt;
  }
}
