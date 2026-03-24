import { describe, it, expect, beforeEach } from "vitest";
import { ListPromotions } from "../use-cases/list-promotions.use-case.js";
import { InMemoryPromotionRepository } from "./mocks/promotion-repository.mock.js";
import { createTestPromotion } from "./fixtures/promotion.fixture.js";

describe("ListPromotions use case", () => {
  let promoRepo: InMemoryPromotionRepository;
  let useCase: ListPromotions;

  beforeEach(() => {
    promoRepo = new InMemoryPromotionRepository();
    useCase = new ListPromotions(promoRepo);
  });

  it("lists all promotions", async () => {
    await promoRepo.save(createTestPromotion({ id: "p1" }));
    await promoRepo.save(createTestPromotion({ id: "p2", status: "active" }));

    const result = await useCase.execute();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(2);
  });

  it("lists active only", async () => {
    await promoRepo.save(createTestPromotion({ id: "p1" }));
    await promoRepo.save(createTestPromotion({ id: "p2", status: "active" }));

    const result = await useCase.execute({ activeOnly: true });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(1);
    expect(result.unwrap()[0].id).toBe("p2");
  });

  it("returns empty array when none exist", async () => {
    const result = await useCase.execute();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(0);
  });
});
