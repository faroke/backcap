import { describe, it, expect, beforeEach } from "vitest";
import { RefundPayment } from "../use-cases/refund-payment.use-case.js";
import { InMemoryPaymentProvider } from "./mocks/payment-provider.mock.js";

describe("RefundPayment use case", () => {
  let paymentProvider: InMemoryPaymentProvider;
  let useCase: RefundPayment;

  beforeEach(() => {
    paymentProvider = new InMemoryPaymentProvider();
    useCase = new RefundPayment(paymentProvider);
  });

  it("refunds full amount", async () => {
    const result = await useCase.execute({ transactionId: "txn-123" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().refundId).toBeDefined();
  });

  it("refunds partial amount", async () => {
    const result = await useCase.execute({
      transactionId: "txn-123",
      amount: 1000,
      currency: "USD",
    });
    expect(result.isOk()).toBe(true);
  });

  it("fails if provider rejects refund", async () => {
    paymentProvider.setShouldFail(true);
    const result = await useCase.execute({ transactionId: "txn-123" });
    expect(result.isFail()).toBe(true);
  });
});
