import { Result } from "../../shared/result.js";
import { Money } from "../value-objects/money.vo.js";
import { BillingPeriod } from "../value-objects/billing-period.vo.js";
import { SubscriptionStatus } from "../value-objects/subscription-status.vo.js";
import { MoneyError } from "../errors/money.error.js";
import { InvalidBillingPeriod } from "../errors/invalid-billing-period.error.js";
import { InvalidSubscriptionStatus } from "../errors/invalid-subscription-status.error.js";
import { SubscriptionStateError } from "../errors/subscription-state.error.js";

export class Subscription {
  readonly id: string;
  readonly customerId: string;
  readonly planId: string;
  readonly status: SubscriptionStatus;
  readonly price: Money;
  readonly billingPeriod: BillingPeriod;
  readonly externalId: string | undefined;
  readonly canceledAt: Date | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(params: {
    id: string;
    customerId: string;
    planId: string;
    status: SubscriptionStatus;
    price: Money;
    billingPeriod: BillingPeriod;
    externalId?: string | undefined;
    canceledAt?: Date | undefined;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.customerId = params.customerId;
    this.planId = params.planId;
    this.status = params.status;
    this.price = params.price;
    this.billingPeriod = params.billingPeriod;
    this.externalId = params.externalId;
    this.canceledAt = params.canceledAt;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static create(params: {
    id: string;
    customerId: string;
    planId: string;
    status: string;
    priceAmount: number;
    priceCurrency: string;
    billingInterval: "monthly" | "yearly";
    billingStartDate: Date;
    billingEndDate: Date;
    externalId?: string;
    canceledAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<Subscription, InvalidSubscriptionStatus | MoneyError | InvalidBillingPeriod> {
    const statusResult = SubscriptionStatus.create(params.status);
    if (statusResult.isFail()) return Result.fail(statusResult.unwrapError());

    const priceResult = Money.create(params.priceAmount, params.priceCurrency);
    if (priceResult.isFail()) return Result.fail(priceResult.unwrapError());

    const periodResult = BillingPeriod.create(params.billingInterval, params.billingStartDate, params.billingEndDate);
    if (periodResult.isFail()) return Result.fail(periodResult.unwrapError());

    const now = new Date();
    return Result.ok(
      new Subscription({
        id: params.id,
        customerId: params.customerId,
        planId: params.planId,
        status: statusResult.unwrap(),
        price: priceResult.unwrap(),
        billingPeriod: periodResult.unwrap(),
        externalId: params.externalId,
        canceledAt: params.canceledAt,
        createdAt: params.createdAt ?? now,
        updatedAt: params.updatedAt ?? now,
      }),
    );
  }

  cancel(reason?: string): Result<Subscription, SubscriptionStateError> {
    if (this.status.isCanceled()) {
      return Result.fail(SubscriptionStateError.alreadyCanceled());
    }
    const canceledStatus = SubscriptionStatus.create("canceled").unwrap();
    return Result.ok(
      new Subscription({
        id: this.id,
        customerId: this.customerId,
        planId: this.planId,
        status: canceledStatus,
        price: this.price,
        billingPeriod: this.billingPeriod,
        externalId: this.externalId,
        canceledAt: new Date(),
        createdAt: this.createdAt,
        updatedAt: new Date(),
      }),
    );
  }

  changePlan(newPlanId: string, newPrice: Money): Result<Subscription, SubscriptionStateError | MoneyError> {
    if (this.status.isCanceled()) {
      return Result.fail(SubscriptionStateError.cannotChangePlanWhenCanceled());
    }
    if (newPrice.currency !== this.price.currency) {
      return Result.fail(MoneyError.currencyMismatch(this.price.currency, newPrice.currency));
    }
    return Result.ok(
      new Subscription({
        id: this.id,
        customerId: this.customerId,
        planId: newPlanId,
        status: this.status,
        price: newPrice,
        billingPeriod: this.billingPeriod,
        externalId: this.externalId,
        canceledAt: this.canceledAt,
        createdAt: this.createdAt,
        updatedAt: new Date(),
      }),
    );
  }
}
