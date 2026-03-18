import { describe, it, expect, beforeEach, vi } from "vitest";
import { StripeWebhookHandler } from "../stripe-webhook-handler.js";
import type { StripeWebhookEvent, IWebhookEventStore } from "../stripe-webhook-handler.js";
import type { ICustomerRepository } from "../../../../capabilities/billing/application/ports/customer-repository.port.js";
import type { ISubscriptionRepository } from "../../../../capabilities/billing/application/ports/subscription-repository.port.js";
import type { IInvoiceRepository } from "../../../../capabilities/billing/application/ports/invoice-repository.port.js";
import { Subscription } from "../../../../capabilities/billing/domain/entities/subscription.entity.js";
import { Invoice } from "../../../../capabilities/billing/domain/entities/invoice.entity.js";
import { Money } from "../../../../capabilities/billing/domain/value-objects/money.vo.js";

function createMockRepos() {
  const customers: ICustomerRepository = {
    findById: vi.fn().mockResolvedValue(null),
    findByExternalId: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
  };
  const subscriptions: ISubscriptionRepository = {
    findById: vi.fn().mockResolvedValue(null),
    findByExternalId: vi.fn().mockResolvedValue(null),
    findByCustomerId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
  const invoices: IInvoiceRepository = {
    findById: vi.fn().mockResolvedValue(null),
    findByCustomerId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
  return { customers, subscriptions, invoices };
}

function createMockEventStore(): IWebhookEventStore {
  return {
    isProcessed: vi.fn().mockResolvedValue(false),
    markProcessed: vi.fn().mockResolvedValue(undefined),
  };
}

function createActiveSubscription(id: string, customerId: string, externalId: string): Subscription {
  return Subscription.create({
    id,
    customerId,
    planId: "plan_1",
    status: "active",
    priceAmount: 2500,
    priceCurrency: "USD",
    billingInterval: "monthly",
    billingStartDate: new Date("2026-01-01"),
    billingEndDate: new Date("2026-02-01"),
    externalId,
  }).unwrap();
}

function createOpenInvoice(id: string, customerId: string, subscriptionId: string): Invoice {
  return Invoice.create({
    id,
    customerId,
    subscriptionId,
    amountValue: 2500,
    amountCurrency: "USD",
    status: "open",
    dueDate: new Date("2026-02-15"),
  }).unwrap();
}

describe("StripeWebhookHandler", () => {
  let repos: ReturnType<typeof createMockRepos>;
  let eventStore: IWebhookEventStore;
  let handler: StripeWebhookHandler;

  beforeEach(() => {
    repos = createMockRepos();
    eventStore = createMockEventStore();
    handler = new StripeWebhookHandler(repos.customers, repos.subscriptions, repos.invoices, eventStore);
  });

  describe("idempotency", () => {
    it("skips already-processed events", async () => {
      (eventStore.isProcessed as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const event: StripeWebhookEvent = {
        id: "evt_dup",
        type: "payment_intent.succeeded",
        data: { object: { customer: "cus_123" } },
      };

      const result = await handler.handle(event);

      expect(result.handled).toBe(true);
      expect(repos.customers.findByExternalId).not.toHaveBeenCalled();
      expect(eventStore.markProcessed).not.toHaveBeenCalled();
    });

    it("marks events as processed after handling", async () => {
      const event: StripeWebhookEvent = {
        id: "evt_new",
        type: "payment_intent.succeeded",
        data: { object: { customer: "cus_123" } },
      };

      await handler.handle(event);

      expect(eventStore.markProcessed).toHaveBeenCalledWith(
        "evt_new",
        "payment_intent.succeeded",
        JSON.stringify({ customer: "cus_123" }),
      );
    });
  });

  describe("payment_intent.succeeded", () => {
    it("looks up customer by external ID", async () => {
      const event: StripeWebhookEvent = {
        id: "evt_1",
        type: "payment_intent.succeeded",
        data: { object: { customer: "cus_123", amount: 2500 } },
      };

      const result = await handler.handle(event);

      expect(result.handled).toBe(true);
      expect(result.eventType).toBe("payment_intent.succeeded");
      expect(repos.customers.findByExternalId).toHaveBeenCalledWith("cus_123");
    });

    it("handles missing customer field gracefully", async () => {
      const event: StripeWebhookEvent = {
        id: "evt_2",
        type: "payment_intent.succeeded",
        data: { object: { amount: 1000 } },
      };

      const result = await handler.handle(event);

      expect(result.handled).toBe(true);
      expect(repos.customers.findByExternalId).not.toHaveBeenCalled();
    });
  });

  describe("invoice.paid", () => {
    it("finds subscription by external ID and marks open invoice as paid", async () => {
      const subscription = createActiveSubscription("sub_int_1", "cust_int_1", "sub_abc");
      const invoice = createOpenInvoice("inv_1", "cust_int_1", "sub_int_1");

      (repos.subscriptions.findByExternalId as ReturnType<typeof vi.fn>).mockResolvedValue(subscription);
      (repos.invoices.findByCustomerId as ReturnType<typeof vi.fn>).mockResolvedValue([invoice]);

      const event: StripeWebhookEvent = {
        id: "evt_3",
        type: "invoice.paid",
        data: { object: { subscription: "sub_abc", amount_paid: 2500 } },
      };

      const result = await handler.handle(event);

      expect(result.handled).toBe(true);
      expect(result.eventType).toBe("invoice.paid");
      expect(repos.subscriptions.findByExternalId).toHaveBeenCalledWith("sub_abc");
      expect(repos.invoices.findByCustomerId).toHaveBeenCalledWith("cust_int_1");
      expect(repos.invoices.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: "paid" }),
      );
    });

    it("handles invoice without subscription gracefully", async () => {
      const event: StripeWebhookEvent = {
        id: "evt_4",
        type: "invoice.paid",
        data: { object: { amount_paid: 500 } },
      };

      const result = await handler.handle(event);

      expect(result.handled).toBe(true);
      expect(repos.subscriptions.findByExternalId).not.toHaveBeenCalled();
    });

    it("does nothing when subscription not found locally", async () => {
      (repos.subscriptions.findByExternalId as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const event: StripeWebhookEvent = {
        id: "evt_4b",
        type: "invoice.paid",
        data: { object: { subscription: "sub_unknown" } },
      };

      const result = await handler.handle(event);

      expect(result.handled).toBe(true);
      expect(repos.invoices.save).not.toHaveBeenCalled();
    });
  });

  describe("customer.subscription.updated", () => {
    it("cancels subscription when Stripe status is canceled", async () => {
      const subscription = createActiveSubscription("sub_int_2", "cust_int_2", "sub_xyz");

      (repos.subscriptions.findByExternalId as ReturnType<typeof vi.fn>).mockResolvedValue(subscription);

      const event: StripeWebhookEvent = {
        id: "evt_5",
        type: "customer.subscription.updated",
        data: { object: { id: "sub_xyz", status: "canceled" } },
      };

      const result = await handler.handle(event);

      expect(result.handled).toBe(true);
      expect(result.eventType).toBe("customer.subscription.updated");
      expect(repos.subscriptions.findByExternalId).toHaveBeenCalledWith("sub_xyz");
      expect(repos.subscriptions.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: expect.objectContaining({ value: "canceled" }),
        }),
      );
    });

    it("does not update when status is unchanged", async () => {
      const subscription = createActiveSubscription("sub_int_3", "cust_int_3", "sub_xyz2");

      (repos.subscriptions.findByExternalId as ReturnType<typeof vi.fn>).mockResolvedValue(subscription);

      const event: StripeWebhookEvent = {
        id: "evt_5b",
        type: "customer.subscription.updated",
        data: { object: { id: "sub_xyz2", status: "active" } },
      };

      await handler.handle(event);

      expect(repos.subscriptions.save).not.toHaveBeenCalled();
    });

    it("does nothing when subscription not found locally", async () => {
      const event: StripeWebhookEvent = {
        id: "evt_5c",
        type: "customer.subscription.updated",
        data: { object: { id: "sub_gone", status: "canceled" } },
      };

      await handler.handle(event);

      expect(repos.subscriptions.save).not.toHaveBeenCalled();
    });
  });

  describe("unhandled events", () => {
    it("returns handled=false for unknown event types", async () => {
      const event: StripeWebhookEvent = {
        id: "evt_6",
        type: "charge.refunded",
        data: { object: { id: "ch_123" } },
      };

      const result = await handler.handle(event);

      expect(result.handled).toBe(false);
      expect(result.eventType).toBe("charge.refunded");
      expect(eventStore.markProcessed).not.toHaveBeenCalled();
    });
  });
});
