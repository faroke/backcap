export class CarrierNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CarrierNotFound";
  }
  static create(carrierId: string): CarrierNotFound {
    return new CarrierNotFound(`Carrier not found: "${carrierId}"`);
  }
}
