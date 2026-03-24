import { CouponCode } from "../../../domain/entities/coupon-code.entity.js";

export function createTestCoupon(
  overrides?: Partial<{
    id: string;
    code: string;
    promotionId: string;
    maxUsesTotal: number | null;
    maxUsesPerCustomer: number | null;
    currentUses: number;
    startDate: Date;
    endDate: Date;
  }>,
): CouponCode {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 30);

  const result = CouponCode.create({
    id: overrides?.id ?? "coupon-test-1",
    code: overrides?.code ?? "SAVE10",
    promotionId: overrides?.promotionId ?? "promo-test-1",
    maxUsesTotal: overrides?.maxUsesTotal ?? 100,
    maxUsesPerCustomer: overrides?.maxUsesPerCustomer ?? 1,
    currentUses: overrides?.currentUses ?? 0,
    startDate: overrides?.startDate ?? now,
    endDate: overrides?.endDate ?? endDate,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test coupon: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
