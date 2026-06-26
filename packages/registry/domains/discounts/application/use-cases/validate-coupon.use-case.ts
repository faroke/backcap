import { Result } from "../../shared/result.js";
import { CouponNotFound } from "../../domain/errors/coupon-not-found.error.js";
import { PromotionNotFound } from "../../domain/errors/promotion-not-found.error.js";
import type { ICouponRepository } from "../ports/coupon-repository.port.js";
import type { IPromotionRepository } from "../ports/promotion-repository.port.js";

export class ValidateCoupon {
  constructor(
    private readonly couponRepository: ICouponRepository,
    private readonly promotionRepository: IPromotionRepository,
  ) {}

  async execute(
    code: string,
  ): Promise<Result<{ valid: boolean; promotionId: string; promotionName: string }, CouponNotFound | PromotionNotFound>> {
    const coupon = await this.couponRepository.findByCode(code);
    if (!coupon) {
      return Result.fail(CouponNotFound.create(code));
    }

    const promotion = await this.promotionRepository.findById(coupon.promotionId);
    if (!promotion) {
      return Result.fail(PromotionNotFound.create(coupon.promotionId));
    }

    const valid = coupon.isValid() && promotion.status.isActive();

    return Result.ok({
      valid,
      promotionId: promotion.id,
      promotionName: promotion.name,
    });
  }
}
