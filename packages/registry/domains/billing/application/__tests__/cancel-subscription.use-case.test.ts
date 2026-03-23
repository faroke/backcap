import { describe, it, expect, beforeEach } from "vitest";
import { CancelSubscription } from "../use-cases/cancel-subscription.use-case.js";
import { InMemorySubscriptionRepository } from "./mocks/subscription-repository.mock.js";
import { InMemoryPaymentProvider } from "./mocks/payment-provider.mock.js";
import { createTestSubscription } from "./fixtures/subscription.fixture.js";
import { SubscriptionNotFound } from "../../domain/errors/subscription-not-found.error.js";

describe("CancelSubscription use case", () => {
  let subscriptionRepo: InMemorySubscriptionRepository;
  let paymentProvider: InMemoryPaymentProvider;
  let useCase: CancelSubscription;

  beforeEach(() => {
    subscriptionRepo = new InMemorySubscriptionRepository();
    paymentProvider = new InMemoryPaymentProvider();
    useCase = new CancelSubscription(subscriptionRepo, paymentProvider);
  });

  it("cancels a subscription successfully", async () => {
    const sub = createTestSubscription({ externalId: "ext-sub-1" });
    await subscriptionRepo.save(sub);

    const result = await useCase.execute({
      subscriptionId: sub.id,
      reason: "user request",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.subscriptionId).toBe(sub.id);

    const saved = await subscriptionRepo.findById(sub.id);
    expect(saved!.status.isCanceled()).toBe(true);
  });

  it("fails if subscription not found", async () => {
    const result = await useCase.execute({ subscriptionId: "nonexistent" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(SubscriptionNotFound);
  });

  it("fails if subscription already canceled", async () => {
    const sub = createTestSubscription({ status: "canceled" });
    await subscriptionRepo.save(sub);

    const result = await useCase.execute({ subscriptionId: sub.id });
    expect(result.isFail()).toBe(true);
  });
});
