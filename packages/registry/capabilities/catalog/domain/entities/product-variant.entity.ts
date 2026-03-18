// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { SKU } from "../value-objects/sku.vo.js";
import { Money } from "../value-objects/money.vo.js";

export class ProductVariant {
  readonly id: string;
  readonly productId: string;
  readonly sku: SKU;
  readonly price: Money;
  readonly attributes: Record<string, string>;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    productId: string,
    sku: SKU,
    price: Money,
    attributes: Record<string, string>,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.productId = productId;
    this.sku = sku;
    this.price = price;
    this.attributes = attributes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(params: {
    id: string;
    productId: string;
    sku: string;
    priceCents: number;
    currency?: string;
    attributes?: Record<string, string>;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<ProductVariant, Error> {
    const skuResult = SKU.create(params.sku);
    if (skuResult.isFail()) {
      return Result.fail(skuResult.unwrapError());
    }

    const priceResult = Money.create(params.priceCents, params.currency ?? "USD");
    if (priceResult.isFail()) {
      return Result.fail(priceResult.unwrapError());
    }

    const now = new Date();
    return Result.ok(
      new ProductVariant(
        params.id,
        params.productId,
        skuResult.unwrap(),
        priceResult.unwrap(),
        params.attributes ?? {},
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }
}
