import { Result } from "../../shared/result.js";
import { DiscountType } from "../value-objects/discount-type.vo.js";
import { Money } from "../value-objects/money.vo.js";

export class DiscountRule {
  readonly id: string;
  readonly type: DiscountType;
  readonly percentageValue: number | undefined;
  readonly fixedAmount: Money | undefined;
  readonly buyQuantity: number | undefined;
  readonly getQuantity: number | undefined;
  readonly maxDiscountAmount: Money | undefined;
  readonly createdAt: Date;

  private constructor(params: {
    id: string;
    type: DiscountType;
    percentageValue?: number;
    fixedAmount?: Money;
    buyQuantity?: number;
    getQuantity?: number;
    maxDiscountAmount?: Money;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.type = params.type;
    this.percentageValue = params.percentageValue;
    this.fixedAmount = params.fixedAmount;
    this.buyQuantity = params.buyQuantity;
    this.getQuantity = params.getQuantity;
    this.maxDiscountAmount = params.maxDiscountAmount;
    this.createdAt = params.createdAt;
  }

  static create(params: {
    id: string;
    type: string;
    percentageValue?: number;
    fixedAmountValue?: number;
    fixedAmountCurrency?: string;
    buyQuantity?: number;
    getQuantity?: number;
    maxDiscountAmountValue?: number;
    maxDiscountAmountCurrency?: string;
    createdAt?: Date;
  }): Result<DiscountRule, Error> {
    if (!params.id || params.id.trim() === "") {
      return Result.fail(new Error("Discount rule id is required"));
    }

    const typeResult = DiscountType.create(params.type);
    if (typeResult.isFail()) return Result.fail(typeResult.unwrapError());
    const type = typeResult.unwrap();

    let percentageValue: number | undefined;
    let fixedAmount: Money | undefined;
    let buyQuantity: number | undefined;
    let getQuantity: number | undefined;
    let maxDiscountAmount: Money | undefined;

    if (type.isPercentage()) {
      if (params.percentageValue === undefined || params.percentageValue <= 0 || params.percentageValue > 100) {
        return Result.fail(new Error("Percentage value must be between 0 (exclusive) and 100 (inclusive)"));
      }
      percentageValue = params.percentageValue;

      if (params.maxDiscountAmountValue !== undefined && params.maxDiscountAmountCurrency !== undefined) {
        const maxResult = Money.create(params.maxDiscountAmountValue, params.maxDiscountAmountCurrency);
        if (maxResult.isFail()) return Result.fail(maxResult.unwrapError());
        maxDiscountAmount = maxResult.unwrap();
      }
    } else if (type.isFixedAmount()) {
      if (params.fixedAmountValue === undefined || params.fixedAmountCurrency === undefined) {
        return Result.fail(new Error("Fixed amount value and currency are required for fixed_amount type"));
      }
      const fixedResult = Money.create(params.fixedAmountValue, params.fixedAmountCurrency);
      if (fixedResult.isFail()) return Result.fail(fixedResult.unwrapError());
      fixedAmount = fixedResult.unwrap();
    } else if (type.isBuyXGetY()) {
      if (
        params.buyQuantity === undefined ||
        params.getQuantity === undefined ||
        !Number.isInteger(params.buyQuantity) ||
        !Number.isInteger(params.getQuantity) ||
        params.buyQuantity <= 0 ||
        params.getQuantity <= 0
      ) {
        return Result.fail(new Error("buyQuantity and getQuantity must be positive integers for buy_x_get_y type"));
      }
      buyQuantity = params.buyQuantity;
      getQuantity = params.getQuantity;
    }

    return Result.ok(
      new DiscountRule({
        id: params.id,
        type,
        percentageValue,
        fixedAmount,
        buyQuantity,
        getQuantity,
        maxDiscountAmount,
        createdAt: params.createdAt ?? new Date(),
      }),
    );
  }

  calculateDiscount(orderTotalCents: number, currency: string): Result<Money, Error> {
    if (this.type.isPercentage()) {
      let discountCents = Math.round(orderTotalCents * this.percentageValue! / 100);
      if (this.maxDiscountAmount && this.maxDiscountAmount.currency === currency && discountCents > this.maxDiscountAmount.amount) {
        discountCents = this.maxDiscountAmount.amount;
      }
      return Money.create(discountCents, currency);
    }

    if (this.type.isFixedAmount()) {
      if (this.fixedAmount!.currency !== currency) {
        return Result.fail(new Error(`Currency mismatch: rule is ${this.fixedAmount!.currency}, order is ${currency}`));
      }
      return Result.ok(this.fixedAmount!);
    }

    // buy_x_get_y: stub returning zero
    return Money.zero(currency);
  }
}
