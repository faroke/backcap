import type { Result } from "../shared/result.js";
import type { Subscription } from "../domain/entities/subscription.entity.js";
import type { Invoice } from "../domain/entities/invoice.entity.js";
import type { SubscriptionCreated } from "../domain/events/subscription-created.event.js";
import type { SubscriptionCanceled } from "../domain/events/subscription-canceled.event.js";
import type { PaymentSucceeded } from "../domain/events/payment-succeeded.event.js";
import type { InvoiceGenerated } from "../domain/events/invoice-generated.event.js";

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
  createSubscription(input: BillingCreateSubscriptionInput): Promise<Result<{ subscriptionId: string; event: SubscriptionCreated }, Error>>;
  cancelSubscription(input: BillingCancelSubscriptionInput): Promise<Result<{ event: SubscriptionCanceled }, Error>>;
  changeSubscriptionPlan(input: BillingChangeSubscriptionPlanInput): Promise<Result<{ subscriptionId: string }, Error>>;
  getSubscription(subscriptionId: string): Promise<Result<Subscription, Error>>;

  processPayment(input: BillingProcessPaymentInput): Promise<Result<{ transactionId: string; event: PaymentSucceeded }, Error>>;
  refundPayment(input: BillingRefundPaymentInput): Promise<Result<{ refundId: string }, Error>>;
  getPaymentHistory(customerId: string): Promise<Result<Invoice[], Error>>;

  generateInvoice(input: BillingGenerateInvoiceInput): Promise<Result<{ invoiceId: string; event: InvoiceGenerated }, Error>>;
  getInvoice(invoiceId: string): Promise<Result<Invoice, Error>>;
  listInvoices(customerId: string): Promise<Result<Invoice[], Error>>;
}
