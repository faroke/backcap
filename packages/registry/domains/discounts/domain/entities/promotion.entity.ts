import { Result } from "../../shared/result.js";
import { PromotionStatus } from "../value-objects/promotion-status.vo.js";
import { ValidityPeriod } from "../value-objects/validity-period.vo.js";
import { Money } from "../value-objects/money.vo.js";
import type { DiscountRule } from "./discount-rule.entity.js";
import type { EligibilityCondition } from "./eligibility-condition.entity.js";

export class Promotion {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: PromotionStatus;
  readonly rules: readonly DiscountRule[];
  readonly conditions: readonly EligibilityCondition[];
  readonly validityPeriod: ValidityPeriod;
  readonly stackable: boolean;
  readonly priority: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(params: {
    id: string;
    name: string;
    description: string;
    status: PromotionStatus;
    rules: readonly DiscountRule[];
    conditions: readonly EligibilityCondition[];
    validityPeriod: ValidityPeriod;
    stackable: boolean;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.status = params.status;
    this.rules = params.rules;
    this.conditions = params.conditions;
    this.validityPeriod = params.validityPeriod;
    this.stackable = params.stackable;
    this.priority = params.priority;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static create(params: {
    id: string;
    name: string;
    description?: string;
    status?: string;
    rules: DiscountRule[];
    conditions?: EligibilityCondition[];
    startDate: Date;
    endDate: Date;
    stackable?: boolean;
    priority?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<Promotion, Error> {
    if (!params.id || params.id.trim() === "") {
      return Result.fail(new Error("Promotion id is required"));
    }
    if (!params.name || params.name.trim() === "") {
      return Result.fail(new Error("Promotion name is required"));
    }
    if (!params.rules || params.rules.length === 0) {
      return Result.fail(new Error("Promotion must have at least one discount rule"));
    }

    const statusResult = PromotionStatus.from(params.status ?? "draft");
    if (statusResult.isFail()) return Result.fail(statusResult.unwrapError());

    const validityResult = ValidityPeriod.create(params.startDate, params.endDate);
    if (validityResult.isFail()) return Result.fail(validityResult.unwrapError());

    const now = new Date();
    return Result.ok(
      new Promotion({
        id: params.id,
        name: params.name,
        description: params.description ?? "",
        status: statusResult.unwrap(),
        rules: params.rules,
        conditions: params.conditions ?? [],
        validityPeriod: validityResult.unwrap(),
        stackable: params.stackable ?? false,
        priority: params.priority ?? 0,
        createdAt: params.createdAt ?? now,
        updatedAt: params.updatedAt ?? now,
      }),
    );
  }

  activate(): Result<Promotion, Error> {
    if (!this.status.canActivate()) {
      return Result.fail(new Error(`Cannot activate promotion in "${this.status.value}" status`));
    }
    return Result.ok(
      new Promotion({
        id: this.id,
        name: this.name,
        description: this.description,
        status: PromotionStatus.active(),
        rules: this.rules,
        conditions: this.conditions,
        validityPeriod: this.validityPeriod,
        stackable: this.stackable,
        priority: this.priority,
        createdAt: this.createdAt,
        updatedAt: new Date(),
      }),
    );
  }

  deactivate(): Result<Promotion, Error> {
    if (!this.status.canDeactivate()) {
      return Result.fail(new Error(`Cannot deactivate promotion in "${this.status.value}" status`));
    }
    const inactiveStatus = PromotionStatus.from("inactive").unwrap();
    return Result.ok(
      new Promotion({
        id: this.id,
        name: this.name,
        description: this.description,
        status: inactiveStatus,
        rules: this.rules,
        conditions: this.conditions,
        validityPeriod: this.validityPeriod,
        stackable: this.stackable,
        priority: this.priority,
        createdAt: this.createdAt,
        updatedAt: new Date(),
      }),
    );
  }

  isEligible(context: {
    orderTotalCents: number;
    orderCurrency: string;
    productIds: string[];
    customerSegment?: string;
    totalItemQuantity: number;
  }): boolean {
    if (!this.status.isActive()) return false;
    if (!this.validityPeriod.isActive()) return false;
    return this.conditions.every((condition) => condition.isSatisfiedBy(context));
  }

  calculateTotalDiscount(orderTotalCents: number, currency: string): Result<Money, Error> {
    const zeroResult = Money.zero(currency);
    if (zeroResult.isFail()) return zeroResult;
    let total = zeroResult.unwrap();

    for (const rule of this.rules) {
      const discountResult = rule.calculateDiscount(orderTotalCents, currency);
      if (discountResult.isFail()) return discountResult;

      const addResult = total.add(discountResult.unwrap());
      if (addResult.isFail()) return addResult;
      total = addResult.unwrap();
    }

    // Cap at order total
    if (total.amount > orderTotalCents) {
      return Money.create(orderTotalCents, currency);
    }

    return Result.ok(total);
  }
}
