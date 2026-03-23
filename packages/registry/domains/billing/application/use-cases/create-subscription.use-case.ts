import { Result } from "../../shared/result.js";
import { Subscription } from "../../domain/entities/subscription.entity.js";
import { SubscriptionCreated } from "../../domain/events/subscription-created.event.js";
import { CustomerNotFound } from "../../domain/errors/customer-not-found.error.js";
import type { ICustomerRepository } from "../ports/customer-repository.port.js";
import type { ISubscriptionRepository } from "../ports/subscription-repository.port.js";
import type { IPaymentProvider } from "../ports/payment-provider.port.js";
import type { CreateSubscriptionInput } from "../dto/create-subscription-input.dto.js";

export class CreateSubscription {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(
    input: CreateSubscriptionInput,
  ): Promise<Result<{ subscriptionId: string; event: SubscriptionCreated }, Error>> {
    const customer = await this.customerRepository.findById(input.customerId);
    if (!customer) {
      return Result.fail(CustomerNotFound.create(input.customerId));
    }

    let externalSubscriptionId: string;
    try {
      const result = await this.paymentProvider.createSubscription(
        customer.externalId ?? customer.id,
        input.planId,
      );
      externalSubscriptionId = result.externalSubscriptionId;
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Provider subscription creation failed";
      return Result.fail(new Error(reason));
    }

    const now = new Date();
    const endDate = new Date(now);
    if (input.billingInterval === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
      if (endDate.getDate() !== now.getDate()) {
        endDate.setDate(0);
      }
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const id = crypto.randomUUID();
    const subscriptionResult = Subscription.create({
      id,
      customerId: input.customerId,
      planId: input.planId,
      status: "active",
      priceAmount: input.priceAmount,
      priceCurrency: input.priceCurrency,
      billingInterval: input.billingInterval,
      billingStartDate: now,
      billingEndDate: endDate,
      externalId: externalSubscriptionId,
    });

    if (subscriptionResult.isFail()) {
      await this.paymentProvider.cancelSubscription(externalSubscriptionId).catch(() => {});
      return Result.fail(subscriptionResult.unwrapError());
    }

    const subscription = subscriptionResult.unwrap();
    try {
      await this.subscriptionRepository.save(subscription);
    } catch (err) {
      await this.paymentProvider.cancelSubscription(externalSubscriptionId).catch(() => {});
      const reason = err instanceof Error ? err.message : "Failed to save subscription";
      return Result.fail(new Error(reason));
    }

    const event = new SubscriptionCreated(subscription.id, input.customerId, input.planId);
    return Result.ok({ subscriptionId: subscription.id, event });
  }
}
