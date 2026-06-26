import { Result } from "../../shared/result.js";
import { Money } from "../../domain/value-objects/money.vo.js";
import { SubscriptionNotFound } from "../../domain/errors/subscription-not-found.error.js";
import { InvalidPlan } from "../../domain/errors/invalid-plan.error.js";
import type { SubscriptionStateError } from "../../domain/errors/subscription-state.error.js";
import type { MoneyError } from "../../domain/errors/money.error.js";
import type { ISubscriptionRepository } from "../ports/subscription-repository.port.js";
import type { ChangeSubscriptionPlanInput } from "../dto/change-subscription-plan-input.dto.js";

export class ChangeSubscriptionPlan {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(
    input: ChangeSubscriptionPlanInput,
  ): Promise<
    Result<
      { subscriptionId: string },
      SubscriptionNotFound | InvalidPlan | SubscriptionStateError | MoneyError
    >
  > {
    const subscription = await this.subscriptionRepository.findById(input.subscriptionId);
    if (!subscription) {
      return Result.fail(SubscriptionNotFound.create(input.subscriptionId));
    }

    const priceResult = Money.create(input.newPriceAmount, input.newPriceCurrency);
    if (priceResult.isFail()) {
      return Result.fail(InvalidPlan.create(input.newPlanId));
    }

    const changeResult = subscription.changePlan(input.newPlanId, priceResult.unwrap());
    if (changeResult.isFail()) {
      return Result.fail(changeResult.unwrapError());
    }

    await this.subscriptionRepository.save(changeResult.unwrap());
    return Result.ok({ subscriptionId: subscription.id });
  }
}
