import { describe, it, expect, beforeEach } from "vitest";
import { CreateSubscription } from "../use-cases/create-subscription.use-case.js";
import { InMemoryCustomerRepository } from "./mocks/customer-repository.mock.js";
import { InMemorySubscriptionRepository } from "./mocks/subscription-repository.mock.js";
import { InMemoryPaymentProvider } from "./mocks/payment-provider.mock.js";
import { createTestCustomer } from "./fixtures/customer.fixture.js";
import { CustomerNotFound } from "../../domain/errors/customer-not-found.error.js";

describe("CreateSubscription use case", () => {
  let customerRepo: InMemoryCustomerRepository;
  let subscriptionRepo: InMemorySubscriptionRepository;
  let paymentProvider: InMemoryPaymentProvider;
  let useCase: CreateSubscription;

  beforeEach(() => {
    customerRepo = new InMemoryCustomerRepository();
    subscriptionRepo = new InMemorySubscriptionRepository();
    paymentProvider = new InMemoryPaymentProvider();
    useCase = new CreateSubscription(customerRepo, subscriptionRepo, paymentProvider);
  });

  it("creates a subscription successfully", async () => {
    const customer = createTestCustomer();
    await customerRepo.save(customer);

    const result = await useCase.execute({
      customerId: customer.id,
      planId: "plan-pro",
      priceAmount: 2999,
      priceCurrency: "USD",
      billingInterval: "monthly",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.subscriptionId).toBeDefined();
    expect(output.event.customerId).toBe(customer.id);
    expect(output.event.planId).toBe("plan-pro");

    const saved = await subscriptionRepo.findById(output.subscriptionId);
    expect(saved).not.toBeNull();
    expect(saved!.price.amount).toBe(2999);
  });

  it("fails if customer not found", async () => {
    const result = await useCase.execute({
      customerId: "nonexistent",
      planId: "plan-pro",
      priceAmount: 2999,
      priceCurrency: "USD",
      billingInterval: "monthly",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CustomerNotFound);
  });
});
