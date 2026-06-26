import { Result } from "../../shared/result.js";
import { InvalidValidityPeriod } from "../errors/invalid-validity-period.error.js";

export class ValidityPeriod {
  readonly startDate: Date;
  readonly endDate: Date;

  private constructor(startDate: Date, endDate: Date) {
    this.startDate = startDate;
    this.endDate = endDate;
  }

  static create(startDate: Date, endDate: Date): Result<ValidityPeriod, InvalidValidityPeriod> {
    if (endDate <= startDate) {
      return Result.fail(InvalidValidityPeriod.create("End date must be after start date"));
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
