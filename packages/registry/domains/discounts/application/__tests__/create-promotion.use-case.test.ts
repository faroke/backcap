import { describe, it, expect, beforeEach } from "vitest";
import { CreatePromotion } from "../use-cases/create-promotion.use-case.js";
import { InMemoryPromotionRepository } from "./mocks/promotion-repository.mock.js";

describe("CreatePromotion use case", () => {
  let promoRepo: InMemoryPromotionRepository;
  let useCase: CreatePromotion;

  const now = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  beforeEach(() => {
    promoRepo = new InMemoryPromotionRepository();
    useCase = new CreatePromotion(promoRepo);
  });

  it("creates a promotion successfully", async () => {
    const result = await useCase.execute({
      id: "promo-1",
      name: "Summer Sale",
      rules: [{ id: "rule-1", type: "percentage", percentageValue: 10 }],
      startDate: now,
      endDate: future,
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.promotionId).toBe("promo-1");
    expect(output.event.promotionId).toBe("promo-1");
    expect(output.event.name).toBe("Summer Sale");

    const saved = await promoRepo.findById("promo-1");
    expect(saved).not.toBeNull();
    expect(saved!.status.isDraft()).toBe(true);
  });

  it("creates with conditions", async () => {
    const result = await useCase.execute({
      id: "promo-2",
      name: "Min Order Promo",
      rules: [{ id: "rule-1", type: "fixed_amount", fixedAmountValue: 500, fixedAmountCurrency: "USD" }],
      conditions: [{ id: "cond-1", type: "min_order_amount", minOrderAmountCents: 5000, minOrderAmountCurrency: "USD" }],
      startDate: now,
      endDate: future,
    });
    expect(result.isOk()).toBe(true);
  });

  it("fails with invalid rule", async () => {
    const result = await useCase.execute({
      id: "promo-3",
      name: "Bad Promo",
      rules: [{ id: "rule-1", type: "percentage", percentageValue: -5 }],
      startDate: now,
      endDate: future,
    });
    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid condition", async () => {
    const result = await useCase.execute({
      id: "promo-4",
      name: "Bad Cond",
      rules: [{ id: "rule-1", type: "percentage", percentageValue: 10 }],
      conditions: [{ id: "cond-1", type: "bogus" }],
      startDate: now,
      endDate: future,
    });
    expect(result.isFail()).toBe(true);
  });

  it("fails with empty name", async () => {
    const result = await useCase.execute({
      id: "promo-5",
      name: "",
      rules: [{ id: "rule-1", type: "percentage", percentageValue: 10 }],
      startDate: now,
      endDate: future,
    });
    expect(result.isFail()).toBe(true);
  });
});
