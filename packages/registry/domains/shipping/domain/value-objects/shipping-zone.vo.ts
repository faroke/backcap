import { Result } from "../../../shared/result.js";

export class ShippingZone {
  readonly originCountry: string;
  readonly destinationCountry: string;

  private constructor(originCountry: string, destinationCountry: string) {
    this.originCountry = originCountry;
    this.destinationCountry = destinationCountry;
  }

  static create(params: { originCountry: string; destinationCountry: string }): Result<ShippingZone, Error> {
    const origin = params.originCountry.trim().toUpperCase();
    const destination = params.destinationCountry.trim().toUpperCase();

    if (!/^[A-Z]{2}$/.test(origin)) {
      return Result.fail(new Error(`Invalid origin country code: "${params.originCountry}"`));
    }
    if (!/^[A-Z]{2}$/.test(destination)) {
      return Result.fail(new Error(`Invalid destination country code: "${params.destinationCountry}"`));
    }

    return Result.ok(new ShippingZone(origin, destination));
  }

  isDomestic(): boolean {
    return this.originCountry === this.destinationCountry;
  }

  equals(other: ShippingZone): boolean {
    return this.originCountry === other.originCountry && this.destinationCountry === other.destinationCountry;
  }
}
