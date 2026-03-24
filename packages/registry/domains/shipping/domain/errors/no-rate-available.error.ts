export class NoRateAvailable extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoRateAvailable";
  }
  static create(zone: string, carrierId?: string): NoRateAvailable {
    const carrierInfo = carrierId ? ` for carrier "${carrierId}"` : "";
    return new NoRateAvailable(`No rate available${carrierInfo} in zone "${zone}"`);
  }
}
