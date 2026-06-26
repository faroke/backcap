import { Result } from "../../shared/result.js";
import { InvalidUsageLimit } from "../errors/invalid-usage-limit.error.js";
import { UsageLimitExhausted } from "../errors/usage-limit-exhausted.error.js";

export class UsageLimit {
  readonly maxUsesTotal: number | null;
  readonly maxUsesPerCustomer: number | null;
  readonly currentUses: number;

  private constructor(maxTotal: number | null, maxPerCustomer: number | null, currentUses: number) {
    this.maxUsesTotal = maxTotal;
    this.maxUsesPerCustomer = maxPerCustomer;
    this.currentUses = currentUses;
  }

  static create(params: {
    maxUsesTotal?: number | null | undefined;
    maxUsesPerCustomer?: number | null | undefined;
    currentUses?: number | undefined;
  }): Result<UsageLimit, InvalidUsageLimit> {
    const maxTotal = params.maxUsesTotal ?? null;
    const maxPerCustomer = params.maxUsesPerCustomer ?? null;
    const currentUses = params.currentUses ?? 0;

    if (maxTotal !== null && (!Number.isInteger(maxTotal) || maxTotal <= 0)) {
      return Result.fail(InvalidUsageLimit.create("maxUsesTotal must be a positive integer"));
    }
    if (maxPerCustomer !== null && (!Number.isInteger(maxPerCustomer) || maxPerCustomer <= 0)) {
      return Result.fail(InvalidUsageLimit.create("maxUsesPerCustomer must be a positive integer"));
    }
    if (!Number.isInteger(currentUses) || currentUses < 0) {
      return Result.fail(InvalidUsageLimit.create("currentUses must be a non-negative integer"));
    }

    return Result.ok(new UsageLimit(maxTotal, maxPerCustomer, currentUses));
  }

  isExhausted(): boolean {
    return this.maxUsesTotal !== null && this.currentUses >= this.maxUsesTotal;
  }

  canBeUsedByCustomer(customerUsageCount: number): boolean {
    return this.maxUsesPerCustomer === null || customerUsageCount < this.maxUsesPerCustomer;
  }

  increment(): Result<UsageLimit, UsageLimitExhausted> {
    if (this.isExhausted()) {
      return Result.fail(UsageLimitExhausted.create());
    }
    return Result.ok(new UsageLimit(this.maxUsesTotal, this.maxUsesPerCustomer, this.currentUses + 1));
  }
}
