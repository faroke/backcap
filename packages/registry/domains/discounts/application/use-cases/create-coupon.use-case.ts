import { Result } from "../../shared/result.js";
import { CouponCode } from "../../domain/entities/coupon-code.entity.js";
import { PromotionNotFound } from "../../domain/errors/promotion-not-found.error.js";
import { CouponCreated } from "../../domain/events/coupon-created.event.js";
import type { InvalidCouponCode } from "../../domain/errors/invalid-coupon-code.error.js";
import type { InvalidUsageLimit } from "../../domain/errors/invalid-usage-limit.error.js";
import type { InvalidValidityPeriod } from "../../domain/errors/invalid-validity-period.error.js";
import type { ICouponRepository } from "../ports/coupon-repository.port.js";
import type { IPromotionRepository } from "../ports/promotion-repository.port.js";
import type { CreateCouponInput } from "../dto/create-coupon-input.dto.js";

export class CreateCoupon {
  constructor(
    private readonly couponRepository: ICouponRepository,
    private readonly promotionRepository: IPromotionRepository,
  ) {}

  async execute(
    input: CreateCouponInput,
  ): Promise<
    Result<
      { couponId: string; event: CouponCreated },
      PromotionNotFound | InvalidCouponCode | InvalidUsageLimit | InvalidValidityPeriod
    >
  > {
    const promotion = await this.promotionRepository.findById(input.promotionId);
    if (!promotion) {
      return Result.fail(PromotionNotFound.create(input.promotionId));
    }

    const couponResult = CouponCode.create({
      id: input.id,
      code: input.code,
      promotionId: input.promotionId,
      maxUsesTotal: input.maxUsesTotal,
      maxUsesPerCustomer: input.maxUsesPerCustomer,
      startDate: input.startDate,
      endDate: input.endDate,
    });
    if (couponResult.isFail()) return Result.fail(couponResult.unwrapError());

    const coupon = couponResult.unwrap();
    await this.couponRepository.save(coupon);

    const event = new CouponCreated(coupon.id, coupon.code, coupon.promotionId);
    return Result.ok({ couponId: coupon.id, event });
  }
}
