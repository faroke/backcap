import type { Money } from "../../../domain/value-objects/money.vo.js";
import type { IPaymentProvider } from "../../ports/payment-provider.port.js";

export class InMemoryPaymentProvider implements IPaymentProvider {
  private shouldFail = false;

  setShouldFail(value: boolean): void {
    this.shouldFail = value;
  }

  async createCustomer(_email: string, _name: string): Promise<string> {
    return `ext-cust-${crypto.randomUUID().slice(0, 8)}`;
  }

  async charge(_customerId: string, _amount: Money, _description?: string): Promise<{ transactionId: string }> {
    if (this.shouldFail) {
      throw new Error("Card declined");
    }
    return { transactionId: `txn-${crypto.randomUUID().slice(0, 8)}` };
  }

  async refund(_transactionId: string, _amount?: Money): Promise<{ refundId: string }> {
    if (this.shouldFail) {
      throw new Error("Refund failed");
    }
    return { refundId: `ref-${crypto.randomUUID().slice(0, 8)}` };
  }

  async createSubscription(_customerId: string, _planId: string): Promise<{ externalSubscriptionId: string }> {
    return { externalSubscriptionId: `ext-sub-${crypto.randomUUID().slice(0, 8)}` };
  }

  async cancelSubscription(_externalSubscriptionId: string): Promise<void> {
    // no-op
  }

  async attachPaymentMethod(_customerId: string, _paymentMethodToken: string): Promise<{ externalPaymentMethodId: string }> {
    return { externalPaymentMethodId: `ext-pm-${crypto.randomUUID().slice(0, 8)}` };
  }
}
