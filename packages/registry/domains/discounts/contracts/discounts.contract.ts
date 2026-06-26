import type { Result } from "../shared/result.js";
import type { Promotion } from "../domain/entities/promotion.entity.js";
import type { PromotionCreated } from "../domain/events/promotion-created.event.js";
import type { PromotionActivated } from "../domain/events/promotion-activated.event.js";
import type { PromotionDeactivated } from "../domain/events/promotion-deactivated.event.js";
import type { CouponCreated } from "../domain/events/coupon-created.event.js";
import type { CouponRedeemed } from "../domain/events/coupon-redeemed.event.js";
import type { DiscountResultOutput } from "../application/dto/discount-result-output.dto.js";
import type { PromotionNotFound } from "../domain/errors/promotion-not-found.error.js";
import type { CouponNotFound } from "../domain/errors/coupon-not-found.error.js";
import type { PromotionInactive } from "../domain/errors/promotion-inactive.error.js";
import type { EligibilityNotMet } from "../domain/errors/eligibility-not-met.error.js";
import type { CouponExpired } from "../domain/errors/coupon-expired.error.js";
import type { CouponUsageExceeded } from "../domain/errors/coupon-usage-exceeded.error.js";
import type { InvalidDiscountRule } from "../domain/errors/invalid-discount-rule.error.js";
import type { InvalidDiscountType } from "../domain/errors/invalid-discount-type.error.js";
import type { InvalidMoney } from "../domain/errors/invalid-money.error.js";
import type { CurrencyMismatch } from "../domain/errors/currency-mismatch.error.js";
import type { InvalidEligibilityCondition } from "../domain/errors/invalid-eligibility-condition.error.js";
import type { InvalidPromotion } from "../domain/errors/invalid-promotion.error.js";
import type { InvalidPromotionStatus } from "../domain/errors/invalid-promotion-status.error.js";
import type { InvalidPromotionTransition } from "../domain/errors/invalid-promotion-transition.error.js";
import type { InvalidValidityPeriod } from "../domain/errors/invalid-validity-period.error.js";
import type { InvalidCouponCode } from "../domain/errors/invalid-coupon-code.error.js";
import type { InvalidUsageLimit } from "../domain/errors/invalid-usage-limit.error.js";
import type { UsageLimitExhausted } from "../domain/errors/usage-limit-exhausted.error.js";

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
  createPromotion(
    input: DiscountsCreatePromotionInput,
  ): Promise<
    Result<
      { promotionId: string; event: PromotionCreated },
      | InvalidDiscountRule
      | InvalidDiscountType
      | InvalidMoney
      | InvalidEligibilityCondition
      | InvalidPromotion
      | InvalidPromotionStatus
      | InvalidValidityPeriod
    >
  >;
  activatePromotion(
    promotionId: string,
  ): Promise<Result<{ event: PromotionActivated }, PromotionNotFound | InvalidPromotionTransition>>;
  deactivatePromotion(
    promotionId: string,
  ): Promise<Result<{ event: PromotionDeactivated }, PromotionNotFound | InvalidPromotionTransition>>;
  getPromotion(promotionId: string): Promise<Result<Promotion, PromotionNotFound>>;
  listPromotions(filter?: { activeOnly?: boolean }): Promise<Result<Promotion[], never>>;

  createCoupon(
    input: DiscountsCreateCouponInput,
  ): Promise<
    Result<
      { couponId: string; event: CouponCreated },
      PromotionNotFound | InvalidCouponCode | InvalidUsageLimit | InvalidValidityPeriod
    >
  >;
  validateCoupon(
    code: string,
  ): Promise<
    Result<{ valid: boolean; promotionId: string; promotionName: string }, CouponNotFound | PromotionNotFound>
  >;
  redeemCoupon(
    input: DiscountsRedeemCouponInput,
  ): Promise<
    Result<
      { discountCents: number; currency: string; event: CouponRedeemed },
      | CouponNotFound
      | PromotionNotFound
      | PromotionInactive
      | EligibilityNotMet
      | CouponExpired
      | CouponUsageExceeded
      | UsageLimitExhausted
      | InvalidMoney
      | CurrencyMismatch
    >
  >;

  applyDiscount(
    input: DiscountsApplyDiscountInput,
  ): Promise<
    Result<DiscountResultOutput, CouponNotFound | PromotionNotFound | InvalidMoney | CurrencyMismatch>
  >;
}
