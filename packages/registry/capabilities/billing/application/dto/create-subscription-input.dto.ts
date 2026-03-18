export interface CreateSubscriptionInput {
  customerId: string;
  planId: string;
  priceAmount: number;
  priceCurrency: string;
  billingInterval: "monthly" | "yearly";
}
