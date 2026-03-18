import { describe, it, expect, beforeEach } from "vitest";
import { ProcessPayment } from "../use-cases/process-payment.use-case.js";
import { InMemoryCustomerRepository } from "./mocks/customer-repository.mock.js";
import { InMemoryPaymentProvider } from "./mocks/payment-provider.mock.js";
import { createTestCustomer } from "./fixtures/customer.fixture.js";
import { CustomerNotFound } from "../../domain/errors/customer-not-found.error.js";
import { PaymentDeclined } from "../../domain/errors/payment-declined.error.js";

describe("ProcessPayment use case", () => {
  let customerRepo: InMemoryCustomerRepository;
  let paymentProvider: InMemoryPaymentProvider;
  let useCase: ProcessPayment;

  beforeEach(() => {
    customerRepo = new InMemoryCustomerRepository();
    paymentProvider = new InMemoryPaymentProvider();
    useCase = new ProcessPayment(customerRepo, paymentProvider);
  });

  it("processes payment successfully", async () => {
    const customer = createTestCustomer();
    await customerRepo.save(customer);

    const result = await useCase.execute({
      customerId: customer.id,
      amount: 5000,
      currency: "USD",
      description: "One-time charge",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.transactionId).toBeDefined();
    expect(output.event.amount).toBe(5000);
    expect(output.event.currency).toBe("USD");
  });

  it("fails if customer not found", async () => {
    const result = await useCase.execute({
      customerId: "nonexistent",
      amount: 5000,
      currency: "USD",
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CustomerNotFound);
  });

  it("fails if payment provider declines", async () => {
    const customer = createTestCustomer();
    await customerRepo.save(customer);
    paymentProvider.setShouldFail(true);

    const result = await useCase.execute({
      customerId: customer.id,
      amount: 5000,
      currency: "USD",
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PaymentDeclined);
  });
});
