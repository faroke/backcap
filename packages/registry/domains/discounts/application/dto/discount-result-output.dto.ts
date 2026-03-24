export interface DiscountResultOutput {
  totalDiscountCents: number;
  currency: string;
  appliedPromotionIds: string[];
  appliedCouponCode: string | null;
  breakdown: Array<{
    promotionId: string;
    promotionName: string;
    discountCents: number;
    ruleType: "percentage" | "fixed_amount" | "buy_x_get_y";
    buyQuantity?: number;
    getQuantity?: number;
  }>;
}
