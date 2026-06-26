import { Result } from "../../shared/result.js";
import { UsageLimit } from "../value-objects/usage-limit.vo.js";
import { ValidityPeriod } from "../value-objects/validity-period.vo.js";
import { CouponExpired } from "../errors/coupon-expired.error.js";
import { CouponUsageExceeded } from "../errors/coupon-usage-exceeded.error.js";
import { InvalidCouponCode } from "../errors/invalid-coupon-code.error.js";
import { InvalidUsageLimit } from "../errors/invalid-usage-limit.error.js";
import { InvalidValidityPeriod } from "../errors/invalid-validity-period.error.js";
import { UsageLimitExhausted } from "../errors/usage-limit-exhausted.error.js";

export class CouponCode {
  readonly id: string;
  readonly code: string;
  readonly promotionId: string;
  readonly usageLimit: UsageLimit;
  readonly validityPeriod: ValidityPeriod;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(params: {
    id: string;
    code: string;
    promotionId: string;
    usageLimit: UsageLimit;
    validityPeriod: ValidityPeriod;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.code = params.code;
    this.promotionId = params.promotionId;
    this.usageLimit = params.usageLimit;
    this.validityPeriod = params.validityPeriod;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static create(params: {
    id: string;
    code: string;
    promotionId: string;
    maxUsesTotal?: number | null | undefined;
    maxUsesPerCustomer?: number | null | undefined;
    currentUses?: number | undefined;
    startDate: Date;
    endDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<CouponCode, InvalidCouponCode | InvalidUsageLimit | InvalidValidityPeriod> {
    if (!params.id || params.id.trim() === "") {
      return Result.fail(InvalidCouponCode.create("Coupon id is required"));
    }
    if (!params.code || params.code.trim() === "") {
      return Result.fail(InvalidCouponCode.create("Coupon code is required"));
    }
    if (!params.promotionId || params.promotionId.trim() === "") {
      return Result.fail(InvalidCouponCode.create("Promotion id is required"));
    }

    const usageLimitResult = UsageLimit.create({
      maxUsesTotal: params.maxUsesTotal,
      maxUsesPerCustomer: params.maxUsesPerCustomer,
      currentUses: params.currentUses,
    });
    if (usageLimitResult.isFail()) return Result.fail(usageLimitResult.unwrapError());

    const validityResult = ValidityPeriod.create(params.startDate, params.endDate);
    if (validityResult.isFail()) return Result.fail(validityResult.unwrapError());

    const now = new Date();
    return Result.ok(
      new CouponCode({
        id: params.id,
        code: params.code.toUpperCase().trim(),
        promotionId: params.promotionId,
        usageLimit: usageLimitResult.unwrap(),
        validityPeriod: validityResult.unwrap(),
        createdAt: params.createdAt ?? now,
        updatedAt: params.updatedAt ?? now,
      }),
    );
  }

  isValid(now?: Date): boolean {
    return this.validityPeriod.isActive(now) && !this.usageLimit.isExhausted();
  }

  redeem(
    customerUsageCount: number,
  ): Result<CouponCode, CouponExpired | CouponUsageExceeded | UsageLimitExhausted> {
    if (!this.validityPeriod.isActive()) {
      return Result.fail(CouponExpired.create(this.code));
    }
    if (this.usageLimit.isExhausted()) {
      return Result.fail(CouponUsageExceeded.create(this.code));
    }
    if (!this.usageLimit.canBeUsedByCustomer(customerUsageCount)) {
      return Result.fail(CouponUsageExceeded.create(this.code));
    }

    const incrementResult = this.usageLimit.increment();
    if (incrementResult.isFail()) return Result.fail(incrementResult.unwrapError());

    return Result.ok(
      new CouponCode({
        id: this.id,
        code: this.code,
        promotionId: this.promotionId,
        usageLimit: incrementResult.unwrap(),
        validityPeriod: this.validityPeriod,
        createdAt: this.createdAt,
        updatedAt: new Date(),
      }),
    );
  }
}
