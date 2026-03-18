import { Result } from "../../shared/result.js";

export type SubscriptionStatusValue =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "paused"
  | "incomplete";

const VALID_STATUSES: SubscriptionStatusValue[] = [
  "active",
  "canceled",
  "past_due",
  "trialing",
  "paused",
  "incomplete",
];

export class SubscriptionStatus {
  readonly value: SubscriptionStatusValue;

  private constructor(value: SubscriptionStatusValue) {
    this.value = value;
  }

  static create(value: string): Result<SubscriptionStatus, Error> {
    if (!VALID_STATUSES.includes(value as SubscriptionStatusValue)) {
      return Result.fail(new Error(`Invalid subscription status: "${value}". Valid: ${VALID_STATUSES.join(", ")}`));
    }
    return Result.ok(new SubscriptionStatus(value as SubscriptionStatusValue));
  }

  isActive(): boolean {
    return this.value === "active" || this.value === "trialing";
  }

  isCanceled(): boolean {
    return this.value === "canceled";
  }
}
