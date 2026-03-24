import { Result } from "../../shared/result.js";

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
    maxUsesTotal?: number | null;
    maxUsesPerCustomer?: number | null;
    currentUses?: number;
  }): Result<UsageLimit, Error> {
    const maxTotal = params.maxUsesTotal ?? null;
    const maxPerCustomer = params.maxUsesPerCustomer ?? null;
    const currentUses = params.currentUses ?? 0;

    if (maxTotal !== null && (!Number.isInteger(maxTotal) || maxTotal <= 0)) {
      return Result.fail(new Error("maxUsesTotal must be a positive integer"));
    }
    if (maxPerCustomer !== null && (!Number.isInteger(maxPerCustomer) || maxPerCustomer <= 0)) {
      return Result.fail(new Error("maxUsesPerCustomer must be a positive integer"));
    }
    if (!Number.isInteger(currentUses) || currentUses < 0) {
      return Result.fail(new Error("currentUses must be a non-negative integer"));
    }

    return Result.ok(new UsageLimit(maxTotal, maxPerCustomer, currentUses));
  }

  isExhausted(): boolean {
    return this.maxUsesTotal !== null && this.currentUses >= this.maxUsesTotal;
  }

  canBeUsedByCustomer(customerUsageCount: number): boolean {
    return this.maxUsesPerCustomer === null || customerUsageCount < this.maxUsesPerCustomer;
  }

  increment(): Result<UsageLimit, Error> {
    if (this.isExhausted()) {
      return Result.fail(new Error("Usage limit exhausted"));
    }
    return Result.ok(new UsageLimit(this.maxUsesTotal, this.maxUsesPerCustomer, this.currentUses + 1));
  }
}
