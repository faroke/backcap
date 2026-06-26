import { Result } from "../../shared/result.js";
import { SubscriptionCanceled } from "../../domain/events/subscription-canceled.event.js";
import { SubscriptionNotFound } from "../../domain/errors/subscription-not-found.error.js";
import { ProviderError } from "../../domain/errors/provider.error.js";
import type { SubscriptionStateError } from "../../domain/errors/subscription-state.error.js";
import type { ISubscriptionRepository } from "../ports/subscription-repository.port.js";
import type { IPaymentProvider } from "../ports/payment-provider.port.js";
import type { CancelSubscriptionInput } from "../dto/cancel-subscription-input.dto.js";

export class CancelSubscription {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(
    input: CancelSubscriptionInput,
  ): Promise<
    Result<
      { event: SubscriptionCanceled },
      SubscriptionNotFound | SubscriptionStateError | ProviderError
    >
  > {
    const subscription = await this.subscriptionRepository.findById(input.subscriptionId);
    if (!subscription) {
      return Result.fail(SubscriptionNotFound.create(input.subscriptionId));
    }

    const cancelResult = subscription.cancel(input.reason);
    if (cancelResult.isFail()) {
      return Result.fail(cancelResult.unwrapError());
    }

    const canceled = cancelResult.unwrap();
    await this.subscriptionRepository.save(canceled);

    if (subscription.externalId) {
      try {
        await this.paymentProvider.cancelSubscription(subscription.externalId);
      } catch (err) {
        const reason = err instanceof Error ? err.message : "Provider cancellation failed";
        return Result.fail(ProviderError.create(reason));
      }
    }

    const event = new SubscriptionCanceled(
      subscription.id,
      subscription.customerId,
      input.reason,
    );
    return Result.ok({ event });
  }
}
