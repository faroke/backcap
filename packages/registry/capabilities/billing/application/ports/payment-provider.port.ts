import type { Money } from "../../domain/value-objects/money.vo.js";

export interface IPaymentProvider {
  createCustomer(email: string, name: string): Promise<string>;
  charge(customerId: string, amount: Money, description?: string): Promise<{ transactionId: string }>;
  refund(transactionId: string, amount?: Money): Promise<{ refundId: string }>;
  createSubscription(customerId: string, planId: string): Promise<{ externalSubscriptionId: string }>;
  cancelSubscription(externalSubscriptionId: string): Promise<void>;
  attachPaymentMethod(customerId: string, paymentMethodToken: string): Promise<{ externalPaymentMethodId: string }>;
}
