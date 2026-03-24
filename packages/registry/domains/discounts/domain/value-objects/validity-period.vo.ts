import { Result } from "../../shared/result.js";

export class ValidityPeriod {
  readonly startDate: Date;
  readonly endDate: Date;

  private constructor(startDate: Date, endDate: Date) {
    this.startDate = startDate;
    this.endDate = endDate;
  }

  static create(startDate: Date, endDate: Date): Result<ValidityPeriod, Error> {
    if (endDate <= startDate) {
      return Result.fail(new Error("End date must be after start date"));
    }
    return Result.ok(new ValidityPeriod(startDate, endDate));
  }

  isActive(now: Date = new Date()): boolean {
    return now >= this.startDate && now <= this.endDate;
  }

  hasExpired(now: Date = new Date()): boolean {
    return now > this.endDate;
  }
}
