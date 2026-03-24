export class ShipmentCreated {
  public readonly shipmentId: string;
  public readonly orderId: string;
  public readonly carrierId: string;
  public readonly occurredAt: Date;

  constructor(shipmentId: string, orderId: string, carrierId: string, occurredAt: Date = new Date()) {
    this.shipmentId = shipmentId;
    this.orderId = orderId;
    this.carrierId = carrierId;
    this.occurredAt = occurredAt;
  }
}
