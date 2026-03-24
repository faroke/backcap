import { Promotion } from "../../../domain/entities/promotion.entity.js";
import { DiscountRule } from "../../../domain/entities/discount-rule.entity.js";
import type { EligibilityCondition } from "../../../domain/entities/eligibility-condition.entity.js";

export function createTestPromotion(
  overrides?: Partial<{
    id: string;
    name: string;
    description: string;
    status: string;
    rules: DiscountRule[];
    conditions: EligibilityCondition[];
    startDate: Date;
    endDate: Date;
    stackable: boolean;
    priority: number;
  }>,
): Promotion {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 30);

  const defaultRule = DiscountRule.create({
    id: "rule-default",
    type: "percentage",
    percentageValue: 10,
  }).unwrap();

  const result = Promotion.create({
    id: overrides?.id ?? "promo-test-1",
    name: overrides?.name ?? "Test Promo",
    description: overrides?.description,
    status: overrides?.status ?? "draft",
    rules: overrides?.rules ?? [defaultRule],
    conditions: overrides?.conditions,
    startDate: overrides?.startDate ?? now,
    endDate: overrides?.endDate ?? endDate,
    stackable: overrides?.stackable,
    priority: overrides?.priority,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test promotion: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
