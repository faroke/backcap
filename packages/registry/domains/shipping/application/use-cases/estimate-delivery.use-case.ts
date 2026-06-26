import { Result } from "../../shared/result.js";
import { ShippingZone } from "../../domain/value-objects/shipping-zone.vo.js";
import { NoRateAvailable } from "../../domain/errors/no-rate-available.error.js";
import type { InvalidShippingZone } from "../../domain/errors/invalid-shipping-zone.error.js";
import type { IRateProvider } from "../ports/rate-provider.port.js";
import type { GetRateInput } from "../dto/get-rate-input.dto.js";

export class EstimateDelivery {
  constructor(private readonly rateProvider: IRateProvider) {}

  async execute(
    input: GetRateInput,
  ): Promise<
    Result<
      { estimatedMinDays: number; estimatedMaxDays: number; estimatedDate: Date },
      InvalidShippingZone | NoRateAvailable
    >
  > {
    const zoneResult = ShippingZone.create({
      originCountry: input.originCountry,
      destinationCountry: input.destinationCountry,
    });
    if (zoneResult.isFail()) {
      return Result.fail(zoneResult.unwrapError());
    }

    const zone = zoneResult.unwrap();
    const rates = await this.rateProvider.getRates(zone, input.weightGrams, input.carrierId);
    if (rates.length === 0) {
      return Result.fail(NoRateAvailable.create(zone.originCountry + "-" + zone.destinationCountry));
    }

    const best = rates.reduce((prev, curr) => (curr.estimatedMinDays < prev.estimatedMinDays ? curr : prev));
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + best.estimatedMinDays);

    return Result.ok({
      estimatedMinDays: best.estimatedMinDays,
      estimatedMaxDays: best.estimatedMaxDays,
      estimatedDate,
    });
  }
}
