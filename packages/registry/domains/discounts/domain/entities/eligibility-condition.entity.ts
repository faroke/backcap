import { Result } from "../../shared/result.js";

export type ConditionType = "min_order_amount" | "product_ids" | "customer_segment" | "min_item_quantity";

const VALID_TYPES: ConditionType[] = ["min_order_amount", "product_ids", "customer_segment", "min_item_quantity"];

export class EligibilityCondition {
  readonly id: string;
  readonly type: ConditionType;
  readonly minOrderAmountCents: number | undefined;
  readonly minOrderAmountCurrency: string | undefined;
  readonly productIds: readonly string[] | undefined;
  readonly customerSegment: string | undefined;
  readonly minItemQuantity: number | undefined;

  private constructor(params: {
    id: string;
    type: ConditionType;
    minOrderAmountCents?: number;
    minOrderAmountCurrency?: string;
    productIds?: readonly string[];
    customerSegment?: string;
    minItemQuantity?: number;
  }) {
    this.id = params.id;
    this.type = params.type;
    this.minOrderAmountCents = params.minOrderAmountCents;
    this.minOrderAmountCurrency = params.minOrderAmountCurrency;
    this.productIds = params.productIds;
    this.customerSegment = params.customerSegment;
    this.minItemQuantity = params.minItemQuantity;
  }

  static create(params: {
    id: string;
    type: string;
    minOrderAmountCents?: number;
    minOrderAmountCurrency?: string;
    productIds?: string[];
    customerSegment?: string;
    minItemQuantity?: number;
  }): Result<EligibilityCondition, Error> {
    if (!params.id || params.id.trim() === "") {
      return Result.fail(new Error("Eligibility condition id is required"));
    }

    if (!VALID_TYPES.includes(params.type as ConditionType)) {
      return Result.fail(new Error(`Invalid condition type: "${params.type}". Valid: ${VALID_TYPES.join(", ")}`));
    }
    const type = params.type as ConditionType;

    if (type === "min_order_amount") {
      if (params.minOrderAmountCents === undefined || params.minOrderAmountCurrency === undefined) {
        return Result.fail(new Error("minOrderAmountCents and minOrderAmountCurrency are required for min_order_amount type"));
      }
    } else if (type === "product_ids") {
      if (!params.productIds || params.productIds.length === 0) {
        return Result.fail(new Error("productIds must be a non-empty array for product_ids type"));
      }
    } else if (type === "customer_segment") {
      if (!params.customerSegment || params.customerSegment.trim() === "") {
        return Result.fail(new Error("customerSegment is required for customer_segment type"));
      }
    } else if (type === "min_item_quantity") {
      if (
        params.minItemQuantity === undefined ||
        !Number.isInteger(params.minItemQuantity) ||
        params.minItemQuantity <= 0
      ) {
        return Result.fail(new Error("minItemQuantity must be a positive integer for min_item_quantity type"));
      }
    }

    return Result.ok(
      new EligibilityCondition({
        id: params.id,
        type,
        minOrderAmountCents: params.minOrderAmountCents,
        minOrderAmountCurrency: params.minOrderAmountCurrency,
        productIds: params.productIds,
        customerSegment: params.customerSegment,
        minItemQuantity: params.minItemQuantity,
      }),
    );
  }

  isSatisfiedBy(context: {
    orderTotalCents: number;
    orderCurrency: string;
    productIds: string[];
    customerSegment?: string;
    totalItemQuantity: number;
  }): boolean {
    switch (this.type) {
      case "min_order_amount":
        return (
          context.orderCurrency === this.minOrderAmountCurrency &&
          context.orderTotalCents >= this.minOrderAmountCents!
        );
      case "product_ids":
        return this.productIds!.some((pid) => context.productIds.includes(pid));
      case "customer_segment":
        return context.customerSegment === this.customerSegment;
      case "min_item_quantity":
        return context.totalItemQuantity >= this.minItemQuantity!;
      default:
        return false;
    }
  }
}
