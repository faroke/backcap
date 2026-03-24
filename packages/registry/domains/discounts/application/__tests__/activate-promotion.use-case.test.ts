import { describe, it, expect, beforeEach } from "vitest";
import { ActivatePromotion } from "../use-cases/activate-promotion.use-case.js";
import { InMemoryPromotionRepository } from "./mocks/promotion-repository.mock.js";
import { createTestPromotion } from "./fixtures/promotion.fixture.js";
import { PromotionNotFound } from "../../domain/errors/promotion-not-found.error.js";

describe("ActivatePromotion use case", () => {
  let promoRepo: InMemoryPromotionRepository;
  let useCase: ActivatePromotion;

  beforeEach(() => {
    promoRepo = new InMemoryPromotionRepository();
    useCase = new ActivatePromotion(promoRepo);
  });

  it("activates a draft promotion", async () => {
    const promo = createTestPromotion({ status: "draft" });
    await promoRepo.save(promo);

    const result = await useCase.execute(promo.id);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.promotionId).toBe(promo.id);

    const updated = await promoRepo.findById(promo.id);
    expect(updated!.status.isActive()).toBe(true);
  });

  it("fails if promotion not found", async () => {
    const result = await useCase.execute("nonexistent");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PromotionNotFound);
  });

  it("fails if already active", async () => {
    const promo = createTestPromotion({ status: "active" });
    await promoRepo.save(promo);

    const result = await useCase.execute(promo.id);
    expect(result.isFail()).toBe(true);
  });
});
