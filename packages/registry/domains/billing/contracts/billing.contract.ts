import type { Result } from "../shared/result.js";
import type { Subscription } from "../domain/entities/subscription.entity.js";
import type { Invoice } from "../domain/entities/invoice.entity.js";
import type { SubscriptionCreated } from "../domain/events/subscription-created.event.js";
import type { SubscriptionCanceled } from "../domain/events/subscription-canceled.event.js";
import type { PaymentSucceeded } from "../domain/events/payment-succeeded.event.js";
import type { InvoiceGenerated } from "../domain/events/invoice-generated.event.js";
import type { CustomerNotFound } from "../domain/errors/customer-not-found.error.js";
import type { SubscriptionNotFound } from "../domain/errors/subscription-not-found.error.js";
import type { InvoiceNotFound } from "../domain/errors/invoice-not-found.error.js";
import type { InvalidPlan } from "../domain/errors/invalid-plan.error.js";
import type { PaymentDeclined } from "../domain/errors/payment-declined.error.js";
import type { MoneyError } from "../domain/errors/money.error.js";
import type { InvalidInvoice } from "../domain/errors/invalid-invoice.error.js";
import type { InvalidBillingPeriod } from "../domain/errors/invalid-billing-period.error.js";
import type { InvalidSubscriptionStatus } from "../domain/errors/invalid-subscription-status.error.js";
import type { SubscriptionStateError } from "../domain/errors/subscription-state.error.js";
import type { ProviderError } from "../domain/errors/provider.error.js";
import type { PersistenceError } from "../domain/errors/persistence.error.js";
import type { InvalidRefund } from "../domain/errors/invalid-refund.error.js";

export interface BillingCreateSubscriptionInput {
  customerId: string;
  planId: string;
  priceAmount: number;
  priceCurrency: string;
  billingInterval: "monthly" | "yearly";
}

export interface BillingCancelSubscriptionInput {
  subscriptionId: string;
  reason?: string;
}

export interface BillingChangeSubscriptionPlanInput {
  subscriptionId: string;
  newPlanId: string;
  newPriceAmount: number;
  newPriceCurrency: string;
}

export interface BillingProcessPaymentInput {
  customerId: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface BillingRefundPaymentInput {
  transactionId: string;
  amount?: number;
  currency?: string;
}

export interface BillingGenerateInvoiceInput {
  customerId: string;
  subscriptionId?: string;
  amountValue: number;
  amountCurrency: string;
  dueDate: Date;
}

export interface IBillingService {
  createSubscription(
    input: BillingCreateSubscriptionInput,
  ): Promise<
    Result<
      { subscriptionId: string; event: SubscriptionCreated },
      | CustomerNotFound
      | ProviderError
      | InvalidSubscriptionStatus
      | MoneyError
      | InvalidBillingPeriod
      | PersistenceError
    >
  >;
  cancelSubscription(
    input: BillingCancelSubscriptionInput,
  ): Promise<
    Result<
      { event: SubscriptionCanceled },
      SubscriptionNotFound | SubscriptionStateError | ProviderError
    >
  >;
  changeSubscriptionPlan(
    input: BillingChangeSubscriptionPlanInput,
  ): Promise<
    Result<
      { subscriptionId: string },
      SubscriptionNotFound | InvalidPlan | SubscriptionStateError | MoneyError
    >
  >;
  getSubscription(subscriptionId: string): Promise<Result<Subscription, SubscriptionNotFound>>;

  processPayment(
    input: BillingProcessPaymentInput,
  ): Promise<
    Result<
      { transactionId: string; event: PaymentSucceeded },
      CustomerNotFound | MoneyError | PaymentDeclined
    >
  >;
  refundPayment(
    input: BillingRefundPaymentInput,
  ): Promise<Result<{ refundId: string }, InvalidRefund | MoneyError | ProviderError>>;
  getPaymentHistory(customerId: string): Promise<Result<Invoice[], CustomerNotFound>>;

  generateInvoice(
    input: BillingGenerateInvoiceInput,
  ): Promise<
    Result<
      { invoiceId: string; event: InvoiceGenerated },
      CustomerNotFound | InvalidInvoice | MoneyError
    >
  >;
  getInvoice(invoiceId: string): Promise<Result<Invoice, InvoiceNotFound>>;
  listInvoices(customerId: string): Promise<Result<Invoice[], CustomerNotFound>>;
}
