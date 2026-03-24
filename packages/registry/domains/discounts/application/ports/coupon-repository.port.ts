import type { CouponCode } from "../../domain/entities/coupon-code.entity.js";

export interface ICouponRepository {
  findById(id: string): Promise<CouponCode | null>;
  findByCode(code: string): Promise<CouponCode | null>;
  findByPromotionId(promotionId: string): Promise<CouponCode[]>;
  countUsagesByCustomer(couponId: string, customerId: string): Promise<number>;
  recordUsage(couponId: string, customerId: string): Promise<void>;
  save(coupon: CouponCode): Promise<void>;
}
