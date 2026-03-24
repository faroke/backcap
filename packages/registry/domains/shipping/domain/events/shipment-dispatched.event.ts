export class ShipmentDispatched {
  public readonly shipmentId: string;
  public readonly trackingNumber: string;
  public readonly occurredAt: Date;

  constructor(shipmentId: string, trackingNumber: string, occurredAt: Date = new Date()) {
    this.shipmentId = shipmentId;
    this.trackingNumber = trackingNumber;
    this.occurredAt = occurredAt;
  }
}
