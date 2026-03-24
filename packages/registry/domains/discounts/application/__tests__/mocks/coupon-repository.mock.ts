import type { CouponCode } from "../../../domain/entities/coupon-code.entity.js";
import type { ICouponRepository } from "../../ports/coupon-repository.port.js";

export class InMemoryCouponRepository implements ICouponRepository {
  private store = new Map<string, CouponCode>();
  private usages = new Map<string, Map<string, number>>();

  async findById(id: string): Promise<CouponCode | null> {
    return this.store.get(id) ?? null;
  }

  async findByCode(code: string): Promise<CouponCode | null> {
    const normalized = code.toUpperCase().trim();
    for (const coupon of this.store.values()) {
      if (coupon.code === normalized) return coupon;
    }
    return null;
  }

  async findByPromotionId(promotionId: string): Promise<CouponCode[]> {
    return [...this.store.values()].filter((c) => c.promotionId === promotionId);
  }

  async countUsagesByCustomer(couponId: string, customerId: string): Promise<number> {
    return this.usages.get(couponId)?.get(customerId) ?? 0;
  }

  async recordUsage(couponId: string, customerId: string): Promise<void> {
    if (!this.usages.has(couponId)) {
      this.usages.set(couponId, new Map());
    }
    const couponUsages = this.usages.get(couponId)!;
    couponUsages.set(customerId, (couponUsages.get(customerId) ?? 0) + 1);
  }

  async save(coupon: CouponCode): Promise<void> {
    this.store.set(coupon.id, coupon);
  }
}
