import { describe, it, expect, beforeEach } from "vitest";
import { GetPromotion } from "../use-cases/get-promotion.use-case.js";
import { InMemoryPromotionRepository } from "./mocks/promotion-repository.mock.js";
import { createTestPromotion } from "./fixtures/promotion.fixture.js";
import { PromotionNotFound } from "../../domain/errors/promotion-not-found.error.js";

describe("GetPromotion use case", () => {
  let promoRepo: InMemoryPromotionRepository;
  let useCase: GetPromotion;

  beforeEach(() => {
    promoRepo = new InMemoryPromotionRepository();
    useCase = new GetPromotion(promoRepo);
  });

  it("returns a promotion by id", async () => {
    const promo = createTestPromotion();
    await promoRepo.save(promo);

    const result = await useCase.execute(promo.id);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().id).toBe(promo.id);
  });

  it("fails if not found", async () => {
    const result = await useCase.execute("nonexistent");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PromotionNotFound);
  });
});
