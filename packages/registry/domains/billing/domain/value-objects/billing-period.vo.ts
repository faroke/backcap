import { Result } from "../../shared/result.js";

export type BillingInterval = "monthly" | "yearly";

export class BillingPeriod {
  readonly interval: BillingInterval;
  readonly startDate: Date;
  readonly endDate: Date;

  private constructor(interval: BillingInterval, startDate: Date, endDate: Date) {
    this.interval = interval;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  static create(interval: BillingInterval, startDate: Date, endDate: Date): Result<BillingPeriod, Error> {
    if (endDate <= startDate) {
      return Result.fail(new Error("End date must be after start date"));
    }
    return Result.ok(new BillingPeriod(interval, startDate, endDate));
  }

  isActive(now: Date = new Date()): boolean {
    return now >= this.startDate && now <= this.endDate;
  }
}
