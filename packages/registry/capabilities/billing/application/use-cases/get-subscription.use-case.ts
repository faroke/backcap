import { Result } from "../../shared/result.js";
import type { Subscription } from "../../domain/entities/subscription.entity.js";
import { SubscriptionNotFound } from "../../domain/errors/subscription-not-found.error.js";
import type { ISubscriptionRepository } from "../ports/subscription-repository.port.js";

export class GetSubscription {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(subscriptionId: string): Promise<Result<Subscription, Error>> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      return Result.fail(SubscriptionNotFound.create(subscriptionId));
    }
    return Result.ok(subscription);
  }
}
