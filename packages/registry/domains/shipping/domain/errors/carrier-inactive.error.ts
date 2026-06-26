export class CarrierInactive extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CarrierInactive";
  }
  static create(carrierId: string): CarrierInactive {
    return new CarrierInactive(`Carrier "${carrierId}" is not active`);
  }
}
