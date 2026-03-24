export class InvalidShipmentTransition extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidShipmentTransition";
  }
  static create(from: string, to: string): InvalidShipmentTransition {
    return new InvalidShipmentTransition(`Invalid shipment transition: "${from}" -> "${to}"`);
  }
}
