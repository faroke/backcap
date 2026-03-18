// Template: import type { ICustomerRepository } from "{{capabilities_path}}/billing/application/ports/customer-repository.port";
import type { ICustomerRepository } from "../../../capabilities/billing/application/ports/customer-repository.port.js";
import type { ISubscriptionRepository } from "../../../capabilities/billing/application/ports/subscription-repository.port.js";
import type { IInvoiceRepository } from "../../../capabilities/billing/application/ports/invoice-repository.port.js";

// Hand-typed Stripe event structures — no hard dependency on `stripe` package.

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export interface StripeWebhookResult {
  handled: boolean;
  eventType: string;
}

export interface IWebhookEventStore {
  isProcessed(eventId: string): Promise<boolean>;
  markProcessed(eventId: string, eventType: string, payload: string): Promise<void>;
}

export class StripeWebhookHandler {
  constructor(
    private readonly customers: ICustomerRepository,
    private readonly subscriptions: ISubscriptionRepository,
    private readonly invoices: IInvoiceRepository,
    private readonly eventStore: IWebhookEventStore,
  ) {}

  async handle(event: StripeWebhookEvent): Promise<StripeWebhookResult> {
    const alreadyProcessed = await this.eventStore.isProcessed(event.id);
    if (alreadyProcessed) {
      return { handled: true, eventType: event.type };
    }

    let handled: boolean;

    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentIntentSucceeded(event.data.object);
        handled = true;
        break;

      case "invoice.paid":
        await this.handleInvoicePaid(event.data.object);
        handled = true;
        break;

      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(event.data.object);
        handled = true;
        break;

      default:
        handled = false;
        break;
    }

    if (handled) {
      await this.eventStore.markProcessed(event.id, event.type, JSON.stringify(event.data.object));
    }

    return { handled, eventType: event.type };
  }

  private async handlePaymentIntentSucceeded(
    data: Record<string, unknown>,
  ): Promise<void> {
    const stripeCustomerId = data.customer as string | undefined;
    if (!stripeCustomerId) return;

    await this.customers.findByExternalId(stripeCustomerId);
  }

  private async handleInvoicePaid(
    data: Record<string, unknown>,
  ): Promise<void> {
    const stripeSubscriptionId = data.subscription as string | undefined;
    if (!stripeSubscriptionId) return;

    const subscription = await this.subscriptions.findByExternalId(stripeSubscriptionId);
    if (!subscription) return;

    const invoices = await this.invoices.findByCustomerId(subscription.customerId);
    const openInvoice = invoices.find(
      (inv) => inv.subscriptionId === subscription.id && (inv.status === "open" || inv.status === "draft"),
    );
    if (openInvoice) {
      const paidResult = openInvoice.markPaid();
      if (paidResult.isOk()) {
        await this.invoices.save(paidResult.unwrap());
      }
    }
  }

  private async handleSubscriptionUpdated(
    data: Record<string, unknown>,
  ): Promise<void> {
    const stripeSubscriptionId = data.id as string | undefined;
    const stripeStatus = data.status as string | undefined;
    if (!stripeSubscriptionId) return;

    const subscription = await this.subscriptions.findByExternalId(stripeSubscriptionId);
    if (!subscription) return;

    if (stripeStatus === "canceled" && !subscription.status.isCanceled()) {
      const cancelResult = subscription.cancel();
      if (cancelResult.isOk()) {
        await this.subscriptions.save(cancelResult.unwrap());
      }
    }
  }
}
