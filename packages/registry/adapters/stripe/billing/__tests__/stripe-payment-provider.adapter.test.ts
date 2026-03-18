import { describe, it, expect, beforeEach, vi } from "vitest";
import { StripePaymentProvider } from "../stripe-payment-provider.adapter.js";
import type { StripeClient } from "../stripe-payment-provider.adapter.js";
import { Money } from "../../../../capabilities/billing/domain/value-objects/money.vo.js";

function createMockStripe(): StripeClient {
  return {
    customers: {
      create: vi.fn(),
    },
    paymentIntents: {
      create: vi.fn(),
    },
    refunds: {
      create: vi.fn(),
    },
    subscriptions: {
      create: vi.fn(),
      cancel: vi.fn(),
    },
    paymentMethods: {
      attach: vi.fn(),
    },
  };
}

describe("StripePaymentProvider", () => {
  let stripe: ReturnType<typeof createMockStripe>;
  let provider: StripePaymentProvider;

  beforeEach(() => {
    stripe = createMockStripe();
    provider = new StripePaymentProvider(stripe);
  });

  describe("createCustomer", () => {
    it("creates a Stripe customer and returns the id", async () => {
      (stripe.customers.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "cus_123",
        email: "alice@example.com",
        name: "Alice",
      });

      const id = await provider.createCustomer("alice@example.com", "Alice");

      expect(id).toBe("cus_123");
      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: "alice@example.com",
        name: "Alice",
      });
    });

    it("wraps Stripe errors", async () => {
      (stripe.customers.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Invalid API Key"),
      );

      await expect(provider.createCustomer("a@b.com", "A")).rejects.toThrow(
        "Stripe createCustomer failed: Invalid API Key",
      );
    });
  });

  describe("charge", () => {
    it("creates a payment intent and returns the transaction id", async () => {
      (stripe.paymentIntents.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "pi_abc",
        status: "succeeded",
      });

      const amount = Money.create(2500, "USD").unwrap();
      const result = await provider.charge("cus_123", amount, "Order #42");

      expect(result.transactionId).toBe("pi_abc");
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 2500,
        currency: "usd",
        customer: "cus_123",
        description: "Order #42",
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      });
    });

    it("works without a description", async () => {
      (stripe.paymentIntents.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "pi_def",
        status: "succeeded",
      });

      const amount = Money.create(1000, "EUR").unwrap();
      const result = await provider.charge("cus_456", amount);

      expect(result.transactionId).toBe("pi_def");
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1000,
          currency: "eur",
          customer: "cus_456",
          description: undefined,
        }),
      );
    });

    it("rejects zero amount", async () => {
      const amount = Money.create(0, "USD").unwrap();
      await expect(provider.charge("cus_123", amount)).rejects.toThrow(
        "Cannot charge a zero amount",
      );
      expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
    });

    it("wraps Stripe errors", async () => {
      (stripe.paymentIntents.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("card_declined"),
      );

      const amount = Money.create(100, "USD").unwrap();
      await expect(provider.charge("cus_123", amount)).rejects.toThrow(
        "Stripe charge failed: card_declined",
      );
    });
  });

  describe("refund", () => {
    it("creates a full refund when no amount is specified", async () => {
      (stripe.refunds.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "re_full",
        status: "succeeded",
      });

      const result = await provider.refund("pi_abc");

      expect(result.refundId).toBe("re_full");
      expect(stripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: "pi_abc",
      });
    });

    it("creates a partial refund when amount is specified", async () => {
      (stripe.refunds.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "re_partial",
        status: "succeeded",
      });

      const amount = Money.create(500, "USD").unwrap();
      const result = await provider.refund("pi_abc", amount);

      expect(result.refundId).toBe("re_partial");
      expect(stripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: "pi_abc",
        amount: 500,
      });
    });

    it("rejects zero amount", async () => {
      const amount = Money.create(0, "USD").unwrap();
      await expect(provider.refund("pi_abc", amount)).rejects.toThrow(
        "Cannot refund a zero amount",
      );
      expect(stripe.refunds.create).not.toHaveBeenCalled();
    });
  });

  describe("createSubscription", () => {
    it("creates a Stripe subscription and returns the external id", async () => {
      (stripe.subscriptions.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "sub_xyz",
        status: "active",
      });

      const result = await provider.createSubscription("cus_123", "price_monthly");

      expect(result.externalSubscriptionId).toBe("sub_xyz");
      expect(stripe.subscriptions.create).toHaveBeenCalledWith({
        customer: "cus_123",
        items: [{ price: "price_monthly" }],
      });
    });
  });

  describe("cancelSubscription", () => {
    it("cancels a Stripe subscription", async () => {
      (stripe.subscriptions.cancel as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "sub_xyz",
        status: "canceled",
      });

      await provider.cancelSubscription("sub_xyz");

      expect(stripe.subscriptions.cancel).toHaveBeenCalledWith("sub_xyz");
    });
  });

  describe("attachPaymentMethod", () => {
    it("attaches a payment method and returns the external id", async () => {
      (stripe.paymentMethods.attach as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "pm_card",
      });

      const result = await provider.attachPaymentMethod("cus_123", "pm_tok");

      expect(result.externalPaymentMethodId).toBe("pm_card");
      expect(stripe.paymentMethods.attach).toHaveBeenCalledWith("pm_tok", {
        customer: "cus_123",
      });
    });
  });
});
