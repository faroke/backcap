export class InvalidShipmentStatus extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidShipmentStatus";
  }
  static create(value: string): InvalidShipmentStatus {
    return new InvalidShipmentStatus(`Invalid shipment status: "${value}"`);
  }
}
