import { describe, it, expect, beforeEach } from "vitest";
import { ChangeSubscriptionPlan } from "../use-cases/change-subscription-plan.use-case.js";
import { InMemorySubscriptionRepository } from "./mocks/subscription-repository.mock.js";
import { createTestSubscription } from "./fixtures/subscription.fixture.js";
import { SubscriptionNotFound } from "../../domain/errors/subscription-not-found.error.js";

describe("ChangeSubscriptionPlan use case", () => {
  let subscriptionRepo: InMemorySubscriptionRepository;
  let useCase: ChangeSubscriptionPlan;

  beforeEach(() => {
    subscriptionRepo = new InMemorySubscriptionRepository();
    useCase = new ChangeSubscriptionPlan(subscriptionRepo);
  });

  it("changes plan successfully", async () => {
    const sub = createTestSubscription();
    await subscriptionRepo.save(sub);

    const result = await useCase.execute({
      subscriptionId: sub.id,
      newPlanId: "plan-enterprise",
      newPriceAmount: 9999,
      newPriceCurrency: "USD",
    });

    expect(result.isOk()).toBe(true);
    const saved = await subscriptionRepo.findById(sub.id);
    expect(saved!.planId).toBe("plan-enterprise");
    expect(saved!.price.amount).toBe(9999);
  });

  it("fails if subscription not found", async () => {
    const result = await useCase.execute({
      subscriptionId: "nonexistent",
      newPlanId: "plan-enterprise",
      newPriceAmount: 9999,
      newPriceCurrency: "USD",
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(SubscriptionNotFound);
  });

  it("fails on canceled subscription", async () => {
    const sub = createTestSubscription({ status: "canceled" });
    await subscriptionRepo.save(sub);

    const result = await useCase.execute({
      subscriptionId: sub.id,
      newPlanId: "plan-enterprise",
      newPriceAmount: 9999,
      newPriceCurrency: "USD",
    });
    expect(result.isFail()).toBe(true);
  });
});
