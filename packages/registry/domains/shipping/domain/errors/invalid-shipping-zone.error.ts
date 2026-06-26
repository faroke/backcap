export class InvalidShippingZone extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidShippingZone";
  }
  static invalidOrigin(code: string): InvalidShippingZone {
    return new InvalidShippingZone(`Invalid origin country code: "${code}"`);
  }
  static invalidDestination(code: string): InvalidShippingZone {
    return new InvalidShippingZone(`Invalid destination country code: "${code}"`);
  }
}
