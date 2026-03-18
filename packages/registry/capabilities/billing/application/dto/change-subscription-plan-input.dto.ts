export interface ChangeSubscriptionPlanInput {
  subscriptionId: string;
  newPlanId: string;
  newPriceAmount: number;
  newPriceCurrency: string;
}
