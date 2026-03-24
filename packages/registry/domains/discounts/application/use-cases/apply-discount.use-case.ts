import { Result } from "../../shared/result.js";
import { CouponNotFound } from "../../domain/errors/coupon-not-found.error.js";
import { PromotionNotFound } from "../../domain/errors/promotion-not-found.error.js";
import type { Promotion } from "../../domain/entities/promotion.entity.js";
import type { IPromotionRepository } from "../ports/promotion-repository.port.js";
import type { ICouponRepository } from "../ports/coupon-repository.port.js";
import type { ApplyDiscountInput } from "../dto/apply-discount-input.dto.js";
import type { DiscountResultOutput } from "../dto/discount-result-output.dto.js";

interface PromotionDiscount {
  promotion: Promotion;
  discountCents: number;
  breakdown: DiscountResultOutput["breakdown"];
}

export class ApplyDiscount {
  constructor(
    private readonly promotionRepository: IPromotionRepository,
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(
    input: ApplyDiscountInput,
  ): Promise<Result<DiscountResultOutput, Error>> {
    const context = {
      orderTotalCents: input.orderTotalCents,
      orderCurrency: input.orderCurrency,
      productIds: input.productIds,
      customerSegment: input.customerSegment,
      totalItemQuantity: input.totalItemQuantity,
    };

    const allActive = await this.promotionRepository.findActive();
    let eligible = allActive.filter((p) => p.isEligible(context));

    // If coupon code provided, include coupon's promotion
    let appliedCouponCode: string | null = null;
    if (input.couponCode) {
      const coupon = await this.couponRepository.findByCode(input.couponCode);
      if (!coupon) {
        return Result.fail(CouponNotFound.create(input.couponCode));
      }

      const couponPromotion = await this.promotionRepository.findById(coupon.promotionId);
      if (!couponPromotion) {
        return Result.fail(PromotionNotFound.create(coupon.promotionId));
      }

      if (couponPromotion.isEligible(context) && !eligible.some((p) => p.id === couponPromotion.id)) {
        eligible.push(couponPromotion);
      }
      appliedCouponCode = input.couponCode;
    }

    if (eligible.length === 0) {
      return Result.ok({
        totalDiscountCents: 0,
        currency: input.orderCurrency,
        appliedPromotionIds: [],
        appliedCouponCode,
        breakdown: [],
      });
    }

    // Calculate discount for each eligible promotion
    const promoDiscounts: PromotionDiscount[] = [];
    for (const promo of eligible) {
      const discountResult = promo.calculateTotalDiscount(input.orderTotalCents, input.orderCurrency);
      if (discountResult.isFail()) return Result.fail(discountResult.unwrapError());

      const discount = discountResult.unwrap();
      const breakdown: DiscountResultOutput["breakdown"] = [];

      for (const rule of promo.rules) {
        const ruleDiscountResult = rule.calculateDiscount(input.orderTotalCents, input.orderCurrency);
        if (ruleDiscountResult.isFail()) return Result.fail(ruleDiscountResult.unwrapError());

        const entry: DiscountResultOutput["breakdown"][number] = {
          promotionId: promo.id,
          promotionName: promo.name,
          discountCents: ruleDiscountResult.unwrap().amount,
          ruleType: rule.type.value,
        };

        if (rule.type.isBuyXGetY()) {
          entry.buyQuantity = rule.buyQuantity;
          entry.getQuantity = rule.getQuantity;
        }

        breakdown.push(entry);
      }

      promoDiscounts.push({
        promotion: promo,
        discountCents: discount.amount,
        breakdown,
      });
    }

    // Stacking algorithm
    const nonStackable = promoDiscounts.filter((pd) => !pd.promotion.stackable);
    const stackable = promoDiscounts.filter((pd) => pd.promotion.stackable);

    // Best non-stackable: highest priority, then highest discount on tie
    let bestNonStackable: PromotionDiscount | null = null;
    if (nonStackable.length > 0) {
      nonStackable.sort((a, b) => {
        if (b.promotion.priority !== a.promotion.priority) {
          return b.promotion.priority - a.promotion.priority;
        }
        return b.discountCents - a.discountCents;
      });
      bestNonStackable = nonStackable[0];
    }

    const stackableSum = stackable.reduce((sum, pd) => sum + pd.discountCents, 0);

    let winners: PromotionDiscount[];
    let totalDiscountCents: number;

    if (bestNonStackable && bestNonStackable.discountCents >= stackableSum) {
      winners = [bestNonStackable];
      totalDiscountCents = bestNonStackable.discountCents;
    } else if (stackable.length > 0) {
      winners = stackable;
      totalDiscountCents = stackableSum;
    } else if (bestNonStackable) {
      winners = [bestNonStackable];
      totalDiscountCents = bestNonStackable.discountCents;
    } else {
      winners = [];
      totalDiscountCents = 0;
    }

    // Cap at order total
    if (totalDiscountCents > input.orderTotalCents) {
      totalDiscountCents = input.orderTotalCents;
    }

    const finalBreakdown = winners.flatMap((w) => w.breakdown);
    const appliedPromotionIds = winners.map((w) => w.promotion.id);

    return Result.ok({
      totalDiscountCents,
      currency: input.orderCurrency,
      appliedPromotionIds,
      appliedCouponCode,
      breakdown: finalBreakdown,
    });
  }
}
