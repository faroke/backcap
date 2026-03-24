import { describe, it, expect } from "vitest";
import { EstimateDelivery } from "../use-cases/estimate-delivery.use-case.js";
import { StubRateProvider } from "./mocks/rate-provider.mock.js";

describe("EstimateDelivery", () => {
  it("returns estimate with minDays, maxDays, estimatedDate", async () => {
    const provider = new StubRateProvider([
      { carrierId: "c1", rateCents: 2000, rateCurrency: "USD", estimatedMinDays: 5, estimatedMaxDays: 7 },
      { carrierId: "c2", rateCents: 3000, rateCurrency: "USD", estimatedMinDays: 2, estimatedMaxDays: 3 },
    ]);
    const useCase = new EstimateDelivery(provider);

    const result = await useCase.execute({
      originCountry: "FR",
      destinationCountry: "US",
      weightGrams: 500,
    });

    expect(result.isOk()).toBe(true);
    const estimate = result.unwrap();
    expect(estimate.estimatedMinDays).toBe(2);
    expect(estimate.estimatedMaxDays).toBe(3);
    expect(estimate.estimatedDate).toBeInstanceOf(Date);
  });

  it("fails when no rates available", async () => {
    const provider = new StubRateProvider([]);
    const useCase = new EstimateDelivery(provider);

    const result = await useCase.execute({
      originCountry: "FR",
      destinationCountry: "US",
      weightGrams: 500,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("NoRateAvailable");
  });
});
