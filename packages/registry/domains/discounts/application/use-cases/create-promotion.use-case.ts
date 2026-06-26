import { Result } from "../../shared/result.js";
import { DiscountRule } from "../../domain/entities/discount-rule.entity.js";
import { EligibilityCondition } from "../../domain/entities/eligibility-condition.entity.js";
import { Promotion } from "../../domain/entities/promotion.entity.js";
import { PromotionCreated } from "../../domain/events/promotion-created.event.js";
import type { InvalidDiscountRule } from "../../domain/errors/invalid-discount-rule.error.js";
import type { InvalidDiscountType } from "../../domain/errors/invalid-discount-type.error.js";
import type { InvalidMoney } from "../../domain/errors/invalid-money.error.js";
import type { InvalidEligibilityCondition } from "../../domain/errors/invalid-eligibility-condition.error.js";
import type { InvalidPromotion } from "../../domain/errors/invalid-promotion.error.js";
import type { InvalidPromotionStatus } from "../../domain/errors/invalid-promotion-status.error.js";
import type { InvalidValidityPeriod } from "../../domain/errors/invalid-validity-period.error.js";
import type { IPromotionRepository } from "../ports/promotion-repository.port.js";
import type { CreatePromotionInput } from "../dto/create-promotion-input.dto.js";

export class CreatePromotion {
  constructor(private readonly promotionRepository: IPromotionRepository) {}

  async execute(
    input: CreatePromotionInput,
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
  > {
    const rules: DiscountRule[] = [];
    for (const ruleInput of input.rules) {
      const ruleResult = DiscountRule.create(ruleInput);
      if (ruleResult.isFail()) return Result.fail(ruleResult.unwrapError());
      rules.push(ruleResult.unwrap());
    }

    const conditions: EligibilityCondition[] = [];
    if (input.conditions) {
      for (const condInput of input.conditions) {
        const condResult = EligibilityCondition.create(condInput);
        if (condResult.isFail()) return Result.fail(condResult.unwrapError());
        conditions.push(condResult.unwrap());
      }
    }

    const promotionResult = Promotion.create({
      id: input.id,
      name: input.name,
      description: input.description,
      rules,
      conditions,
      startDate: input.startDate,
      endDate: input.endDate,
      stackable: input.stackable,
      priority: input.priority,
    });
    if (promotionResult.isFail()) return Result.fail(promotionResult.unwrapError());

    const promotion = promotionResult.unwrap();
    await this.promotionRepository.save(promotion);

    const event = new PromotionCreated(promotion.id, promotion.name);
    return Result.ok({ promotionId: promotion.id, event });
  }
}
