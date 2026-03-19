// Template: import type { IPaymentProvider } from "{{cap_rel}}/billing/application/ports/payment-provider.port.js";
import type { IPaymentProvider } from "../../../capabilities/billing/application/ports/payment-provider.port.js";
// Template: import type { Money } from "{{cap_rel}}/billing/domain/value-objects/money.vo.js";
import type { Money } from "../../../capabilities/billing/domain/value-objects/money.vo.js";

// --- Adapter Swap Pattern ---
// To swap this Stripe adapter for another provider (e.g. Paddle, Braintree):
// 1. Create a new class that implements IPaymentProvider
// 2. Place it in adapters/<provider>/billing/
// 3. Inject the new adapter where StripePaymentProvider was used
// No changes to domain or application layers are required.

// Hand-typed Stripe interfaces — the `stripe` npm package is a peerDependency,
// not a hard dependency of the registry.  Consumers provide the real Stripe
// instance at runtime via the constructor.

interface StripeCustomer {
  id: string;
  email: string;
  name: string;
}

interface StripePaymentIntent {
  id: string;
  status: string;
}

interface StripeRefund {
  id: string;
  status: string;
}

interface StripeSubscription {
  id: string;
  status: string;
}

interface StripePaymentMethod {
  id: string;
}

interface StripeCustomersResource {
  create(params: { email: string; name: string }): Promise<StripeCustomer>;
}

interface StripePaymentIntentsResource {
  create(params: {
    amount: number;
    currency: string;
    customer: string;
    description?: string;
    confirm: boolean;
    automatic_payment_methods?: { enabled: boolean; allow_redirects: string };
  }): Promise<StripePaymentIntent>;
}

interface StripeRefundsResource {
  create(params: { payment_intent: string; amount?: number }): Promise<StripeRefund>;
}

interface StripeSubscriptionsResource {
  create(params: { customer: string; items: Array<{ price: string }> }): Promise<StripeSubscription>;
  cancel(subscriptionId: string): Promise<StripeSubscription>;
}

interface StripePaymentMethodsResource {
  attach(paymentMethodId: string, params: { customer: string }): Promise<StripePaymentMethod>;
}

export interface StripeClient {
  customers: StripeCustomersResource;
  paymentIntents: StripePaymentIntentsResource;
  refunds: StripeRefundsResource;
  subscriptions: StripeSubscriptionsResource;
  paymentMethods: StripePaymentMethodsResource;
}

export class StripePaymentProvider implements IPaymentProvider {
  constructor(private readonly stripe: StripeClient) {}

  async createCustomer(email: string, name: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({ email, name });
      return customer.id;
    } catch (err) {
      throw this.wrapError("createCustomer", err);
    }
  }

  async charge(
    customerId: string,
    amount: Money,
    description?: string,
  ): Promise<{ transactionId: string }> {
    if (amount.isZero()) {
      throw new Error("Cannot charge a zero amount");
    }
    if (amount.isNegative()) {
      throw new Error("Cannot charge a negative amount");
    }
    try {
      // automatic_payment_methods uses the customer's default payment method.
      // Ensure a payment method is attached and set as default before calling charge.
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount.amount,
        currency: amount.currency.toLowerCase(),
        customer: customerId,
        description,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      });
      return { transactionId: paymentIntent.id };
    } catch (err) {
      throw this.wrapError("charge", err);
    }
  }

  async refund(
    transactionId: string,
    amount?: Money,
  ): Promise<{ refundId: string }> {
    if (amount && amount.isZero()) {
      throw new Error("Cannot refund a zero amount");
    }
    if (amount && amount.isNegative()) {
      throw new Error("Cannot refund a negative amount");
    }
    try {
      const params: { payment_intent: string; amount?: number } = {
        payment_intent: transactionId,
      };
      if (amount) {
        params.amount = amount.amount;
      }
      const refund = await this.stripe.refunds.create(params);
      return { refundId: refund.id };
    } catch (err) {
      throw this.wrapError("refund", err);
    }
  }

  async createSubscription(
    customerId: string,
    planId: string,
  ): Promise<{ externalSubscriptionId: string }> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: planId }],
      });
      return { externalSubscriptionId: subscription.id };
    } catch (err) {
      throw this.wrapError("createSubscription", err);
    }
  }

  async cancelSubscription(externalSubscriptionId: string): Promise<void> {
    try {
      await this.stripe.subscriptions.cancel(externalSubscriptionId);
    } catch (err) {
      throw this.wrapError("cancelSubscription", err);
    }
  }

  async attachPaymentMethod(
    customerId: string,
    paymentMethodToken: string,
  ): Promise<{ externalPaymentMethodId: string }> {
    try {
      const pm = await this.stripe.paymentMethods.attach(paymentMethodToken, {
        customer: customerId,
      });
      return { externalPaymentMethodId: pm.id };
    } catch (err) {
      throw this.wrapError("attachPaymentMethod", err);
    }
  }

  private wrapError(operation: string, err: unknown): Error {
    const message = err instanceof Error ? err.message : String(err);
    return new Error(`Stripe ${operation} failed: ${message}`);
  }
}
