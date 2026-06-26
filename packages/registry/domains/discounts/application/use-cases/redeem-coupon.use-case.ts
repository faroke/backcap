import { Result } from "../../shared/result.js";
import { CouponNotFound } from "../../domain/errors/coupon-not-found.error.js";
import { PromotionNotFound } from "../../domain/errors/promotion-not-found.error.js";
import { PromotionInactive } from "../../domain/errors/promotion-inactive.error.js";
import { EligibilityNotMet } from "../../domain/errors/eligibility-not-met.error.js";
import { CouponRedeemed } from "../../domain/events/coupon-redeemed.event.js";
import type { CouponExpired } from "../../domain/errors/coupon-expired.error.js";
import type { CouponUsageExceeded } from "../../domain/errors/coupon-usage-exceeded.error.js";
import type { UsageLimitExhausted } from "../../domain/errors/usage-limit-exhausted.error.js";
import type { InvalidMoney } from "../../domain/errors/invalid-money.error.js";
import type { CurrencyMismatch } from "../../domain/errors/currency-mismatch.error.js";
import type { ICouponRepository } from "../ports/coupon-repository.port.js";
import type { IPromotionRepository } from "../ports/promotion-repository.port.js";
import type { RedeemCouponInput } from "../dto/redeem-coupon-input.dto.js";

export class RedeemCoupon {
  constructor(
    private readonly couponRepository: ICouponRepository,
    private readonly promotionRepository: IPromotionRepository,
  ) {}

  async execute(
    input: RedeemCouponInput,
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
  > {
    const coupon = await this.couponRepository.findByCode(input.code);
    if (!coupon) {
      return Result.fail(CouponNotFound.create(input.code));
    }

    const promotion = await this.promotionRepository.findById(coupon.promotionId);
    if (!promotion) {
      return Result.fail(PromotionNotFound.create(coupon.promotionId));
    }

    if (!promotion.status.isActive()) {
      return Result.fail(PromotionInactive.create(promotion.id));
    }

    const context = {
      orderTotalCents: input.orderTotalCents,
      orderCurrency: input.orderCurrency,
      productIds: input.productIds,
      customerSegment: input.customerSegment,
      totalItemQuantity: input.totalItemQuantity,
    };

    if (!promotion.isEligible(context)) {
      return Result.fail(EligibilityNotMet.create(promotion.id));
    }

    const customerUsageCount = await this.couponRepository.countUsagesByCustomer(
      coupon.id,
      input.customerId,
    );

    const redeemResult = coupon.redeem(customerUsageCount);
    if (redeemResult.isFail()) return Result.fail(redeemResult.unwrapError());

    const discountResult = promotion.calculateTotalDiscount(
      input.orderTotalCents,
      input.orderCurrency,
    );
    if (discountResult.isFail()) return Result.fail(discountResult.unwrapError());

    const discount = discountResult.unwrap();

    await this.couponRepository.save(redeemResult.unwrap());
    await this.couponRepository.recordUsage(coupon.id, input.customerId);

    const event = new CouponRedeemed(
      coupon.id,
      coupon.code,
      promotion.id,
      input.customerId,
      discount.amount,
      discount.currency,
    );

    return Result.ok({ discountCents: discount.amount, currency: discount.currency, event });
  }
}
