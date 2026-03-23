import { Subscription } from "../../../domain/entities/subscription.entity.js";

export function createTestSubscription(
  overrides?: Partial<{
    id: string;
    customerId: string;
    planId: string;
    status: string;
    priceAmount: number;
    priceCurrency: string;
    billingInterval: "monthly" | "yearly";
    billingStartDate: Date;
    billingEndDate: Date;
    externalId: string;
  }>,
): Subscription {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 1);

  const result = Subscription.create({
    id: overrides?.id ?? "sub-test-1",
    customerId: overrides?.customerId ?? "cust-test-1",
    planId: overrides?.planId ?? "plan-pro",
    status: overrides?.status ?? "active",
    priceAmount: overrides?.priceAmount ?? 2999,
    priceCurrency: overrides?.priceCurrency ?? "USD",
    billingInterval: overrides?.billingInterval ?? "monthly",
    billingStartDate: overrides?.billingStartDate ?? now,
    billingEndDate: overrides?.billingEndDate ?? endDate,
    externalId: overrides?.externalId,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test subscription: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
