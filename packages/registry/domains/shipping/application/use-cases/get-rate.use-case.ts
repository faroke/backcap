import { Result } from "../../shared/result.js";
import { ShippingZone } from "../../domain/value-objects/shipping-zone.vo.js";
import type { InvalidShippingZone } from "../../domain/errors/invalid-shipping-zone.error.js";
import type { IRateProvider } from "../ports/rate-provider.port.js";
import type { GetRateInput } from "../dto/get-rate-input.dto.js";
import type { RateOutput } from "../dto/rate-output.dto.js";

export class GetRate {
  constructor(private readonly rateProvider: IRateProvider) {}

  async execute(input: GetRateInput): Promise<Result<RateOutput[], InvalidShippingZone>> {
    const zoneResult = ShippingZone.create({
      originCountry: input.originCountry,
      destinationCountry: input.destinationCountry,
    });
    if (zoneResult.isFail()) {
      return Result.fail(zoneResult.unwrapError());
    }

    const rates = await this.rateProvider.getRates(zoneResult.unwrap(), input.weightGrams, input.carrierId);
    const output: RateOutput[] = rates.map((r) => ({
      carrierId: r.carrierId,
      rateCents: r.rateCents,
      rateCurrency: r.rateCurrency,
      estimatedMinDays: r.estimatedMinDays,
      estimatedMaxDays: r.estimatedMaxDays,
    }));
    return Result.ok(output);
  }
}
