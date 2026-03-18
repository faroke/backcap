import { describe, it, expect, beforeEach } from "vitest";
import { GetSubscription } from "../use-cases/get-subscription.use-case.js";
import { InMemorySubscriptionRepository } from "./mocks/subscription-repository.mock.js";
import { createTestSubscription } from "./fixtures/subscription.fixture.js";
import { SubscriptionNotFound } from "../../domain/errors/subscription-not-found.error.js";

describe("GetSubscription use case", () => {
  let subscriptionRepo: InMemorySubscriptionRepository;
  let useCase: GetSubscription;

  beforeEach(() => {
    subscriptionRepo = new InMemorySubscriptionRepository();
    useCase = new GetSubscription(subscriptionRepo);
  });

  it("returns subscription by id", async () => {
    const sub = createTestSubscription();
    await subscriptionRepo.save(sub);

    const result = await useCase.execute(sub.id);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().id).toBe(sub.id);
  });

  it("fails if not found", async () => {
    const result = await useCase.execute("nonexistent");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(SubscriptionNotFound);
  });
});
