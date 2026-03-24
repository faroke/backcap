import type { Result } from "../shared/result.js";
import type { Promotion } from "../domain/entities/promotion.entity.js";
import type { PromotionCreated } from "../domain/events/promotion-created.event.js";
import type { PromotionActivated } from "../domain/events/promotion-activated.event.js";
import type { PromotionDeactivated } from "../domain/events/promotion-deactivated.event.js";
import type { CouponCreated } from "../domain/events/coupon-created.event.js";
import type { CouponRedeemed } from "../domain/events/coupon-redeemed.event.js";
import type { DiscountResultOutput } from "../application/dto/discount-result-output.dto.js";

export interface DiscountsCreatePromotionInput {
  id: string;
  name: string;
  description?: string;
  rules: Array<{
    id: string;
    type: string;
    percentageValue?: number;
    fixedAmountValue?: number;
    fixedAmountCurrency?: string;
    buyQuantity?: number;
    getQuantity?: number;
    maxDiscountAmountValue?: number;
    maxDiscountAmountCurrency?: string;
  }>;
  conditions?: Array<{
    id: string;
    type: string;
    minOrderAmountCents?: number;
    minOrderAmountCurrency?: string;
    productIds?: string[];
    customerSegment?: string;
    minItemQuantity?: number;
  }>;
  startDate: Date;
  endDate: Date;
  stackable?: boolean;
  priority?: number;
}

export interface DiscountsCreateCouponInput {
  id: string;
  code: string;
  promotionId: string;
  maxUsesTotal?: number | null;
  maxUsesPerCustomer?: number | null;
  startDate: Date;
  endDate: Date;
}

export interface DiscountsRedeemCouponInput {
  code: string;
  customerId: string;
  orderTotalCents: number;
  orderCurrency: string;
  productIds: string[];
  totalItemQuantity: number;
  customerSegment?: string;
}

export interface DiscountsApplyDiscountInput {
  orderTotalCents: number;
  orderCurrency: string;
  productIds: string[];
  customerId: string;
  totalItemQuantity: number;
  customerSegment?: string;
  couponCode?: string;
}

export interface IDiscountsService {
  createPromotion(input: DiscountsCreatePromotionInput): Promise<Result<{ promotionId: string; event: PromotionCreated }, Error>>;
  activatePromotion(promotionId: string): Promise<Result<{ event: PromotionActivated }, Error>>;
  deactivatePromotion(promotionId: string): Promise<Result<{ event: PromotionDeactivated }, Error>>;
  getPromotion(promotionId: string): Promise<Result<Promotion, Error>>;
  listPromotions(filter?: { activeOnly?: boolean }): Promise<Result<Promotion[], Error>>;

  createCoupon(input: DiscountsCreateCouponInput): Promise<Result<{ couponId: string; event: CouponCreated }, Error>>;
  validateCoupon(code: string): Promise<Result<{ valid: boolean; promotionId: string; promotionName: string }, Error>>;
  redeemCoupon(input: DiscountsRedeemCouponInput): Promise<Result<{ discountCents: number; currency: string; event: CouponRedeemed }, Error>>;

  applyDiscount(input: DiscountsApplyDiscountInput): Promise<Result<DiscountResultOutput, Error>>;
}
