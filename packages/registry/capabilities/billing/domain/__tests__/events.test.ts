import { describe, it, expect } from "vitest";
import { SubscriptionCreated } from "../events/subscription-created.event.js";
import { SubscriptionCanceled } from "../events/subscription-canceled.event.js";
import { PaymentSucceeded } from "../events/payment-succeeded.event.js";
import { PaymentFailed } from "../events/payment-failed.event.js";
import { InvoiceGenerated } from "../events/invoice-generated.event.js";

describe("Billing domain events", () => {
  it("creates SubscriptionCreated event", () => {
    const event = new SubscriptionCreated("sub-1", "cust-1", "plan-pro");
    expect(event.subscriptionId).toBe("sub-1");
    expect(event.customerId).toBe("cust-1");
    expect(event.planId).toBe("plan-pro");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("creates SubscriptionCanceled event", () => {
    const event = new SubscriptionCanceled("sub-1", "cust-1", "user request");
    expect(event.subscriptionId).toBe("sub-1");
    expect(event.reason).toBe("user request");
  });

  it("creates PaymentSucceeded event", () => {
    const event = new PaymentSucceeded("cust-1", 2999, "USD");
    expect(event.customerId).toBe("cust-1");
    expect(event.amount).toBe(2999);
    expect(event.currency).toBe("USD");
  });

  it("creates PaymentFailed event", () => {
    const event = new PaymentFailed("cust-1", 2999, "USD", "insufficient funds");
    expect(event.reason).toBe("insufficient funds");
  });

  it("creates InvoiceGenerated event", () => {
    const event = new InvoiceGenerated("inv-1", "cust-1", 2999, "USD");
    expect(event.invoiceId).toBe("inv-1");
    expect(event.customerId).toBe("cust-1");
  });
});
