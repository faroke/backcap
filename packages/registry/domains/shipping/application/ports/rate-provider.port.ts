import type { ShippingZone } from "../../domain/value-objects/shipping-zone.vo.js";

export interface ShippingRateResult {
  carrierId: string;
  rateCents: number;
  rateCurrency: string;
  estimatedMinDays: number;
  estimatedMaxDays: number;
}

export interface IRateProvider {
  getRates(zone: ShippingZone, weightGrams: number, carrierId?: string): Promise<ShippingRateResult[]>;
}
