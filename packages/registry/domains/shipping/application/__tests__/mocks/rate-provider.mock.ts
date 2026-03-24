import type { IRateProvider, ShippingRateResult } from "../../ports/rate-provider.port.js";
import type { ShippingZone } from "../../../domain/value-objects/shipping-zone.vo.js";

export class StubRateProvider implements IRateProvider {
  constructor(private readonly rates: ShippingRateResult[]) {}

  async getRates(_zone: ShippingZone, _weightGrams: number, carrierId?: string): Promise<ShippingRateResult[]> {
    if (carrierId) {
      return this.rates.filter((r) => r.carrierId === carrierId);
    }
    return this.rates;
  }
}
