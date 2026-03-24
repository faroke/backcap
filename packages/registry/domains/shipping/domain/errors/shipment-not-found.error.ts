export class ShipmentNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShipmentNotFound";
  }
  static create(shipmentId: string): ShipmentNotFound {
    return new ShipmentNotFound(`Shipment not found: "${shipmentId}"`);
  }
}
