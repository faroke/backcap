import { describe, it, expect, beforeEach } from "vitest";
import { GetRate } from "../use-cases/get-rate.use-case.js";
import { StubRateProvider } from "./mocks/rate-provider.mock.js";

describe("GetRate", () => {
  it("returns rates from provider", async () => {
    const provider = new StubRateProvider([
      { carrierId: "c1", rateCents: 1500, rateCurrency: "USD", estimatedMinDays: 3, estimatedMaxDays: 5 },
    ]);
    const useCase = new GetRate(provider);

    const result = await useCase.execute({
      originCountry: "FR",
      destinationCountry: "US",
      weightGrams: 500,
    });

    expect(result.isOk()).toBe(true);
    const rates = result.unwrap();
    expect(rates).toHaveLength(1);
    expect(rates[0].carrierId).toBe("c1");
    expect(rates[0].rateCents).toBe(1500);
  });

  it("returns empty array when no rates available", async () => {
    const provider = new StubRateProvider([]);
    const useCase = new GetRate(provider);

    const result = await useCase.execute({
      originCountry: "FR",
      destinationCountry: "US",
      weightGrams: 500,
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(0);
  });

  it("creates correct ShippingZone from input", async () => {
    const provider = new StubRateProvider([
      { carrierId: "c1", rateCents: 1000, rateCurrency: "EUR", estimatedMinDays: 2, estimatedMaxDays: 4 },
    ]);
    const useCase = new GetRate(provider);

    const result = await useCase.execute({
      originCountry: "fr",
      destinationCountry: "us",
      weightGrams: 300,
    });

    expect(result.isOk()).toBe(true);
  });
});
