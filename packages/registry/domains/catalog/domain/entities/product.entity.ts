import { Result } from "../../shared/result.js";
import { Money } from "../value-objects/money.vo.js";
import { ProductStatus } from "../value-objects/product-status.vo.js";
import { ProductVariant } from "./product-variant.entity.js";
import { DuplicateSKU } from "../errors/duplicate-sku.error.js";
import { MoneyError } from "../errors/money.error.js";
import { InvalidProductStatus } from "../errors/invalid-product-status.error.js";
import { InvalidProductName } from "../errors/invalid-product-name.error.js";
import { InvalidProductDescription } from "../errors/invalid-product-description.error.js";
import { ProductNotPublishable } from "../errors/product-not-publishable.error.js";
import { ProductNotArchivable } from "../errors/product-not-archivable.error.js";

export class Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: ProductStatus;
  readonly basePrice: Money;
  readonly categoryId: string | null;
  readonly variants: ProductVariant[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    description: string,
    status: ProductStatus,
    basePrice: Money,
    categoryId: string | null,
    variants: ProductVariant[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.status = status;
    this.basePrice = basePrice;
    this.categoryId = categoryId;
    this.variants = variants;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(params: {
    id: string;
    name: string;
    description: string;
    basePriceCents: number;
    currency?: string | undefined;
    status?: string | undefined;
    categoryId?: string | null | undefined;
    variants?: ProductVariant[] | undefined;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<
    Product,
    InvalidProductName | InvalidProductDescription | MoneyError | InvalidProductStatus
  > {
    if (!params.name || typeof params.name !== "string" || params.name.trim().length === 0) {
      return Result.fail(InvalidProductName.empty());
    }
    if (params.name.trim().length > 500) {
      return Result.fail(InvalidProductName.tooLong());
    }

    if (params.description == null || typeof params.description !== "string") {
      return Result.fail(InvalidProductDescription.required());
    }

    const priceResult = Money.create(params.basePriceCents, params.currency ?? "USD");
    if (priceResult.isFail()) {
      return Result.fail(priceResult.unwrapError());
    }

    let status: ProductStatus;
    if (params.status) {
      const statusResult = ProductStatus.from(params.status);
      if (statusResult.isFail()) {
        return Result.fail(statusResult.unwrapError());
      }
      status = statusResult.unwrap();
    } else {
      status = ProductStatus.draft();
    }

    const now = new Date();
    return Result.ok(
      new Product(
        params.id,
        params.name.trim(),
        params.description,
        status,
        priceResult.unwrap(),
        params.categoryId ?? null,
        params.variants ?? [],
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }

  publish(): Result<Product, ProductNotPublishable> {
    if (!this.status.isDraft()) {
      return Result.fail(ProductNotPublishable.create());
    }
    return Result.ok(
      new Product(
        this.id,
        this.name,
        this.description,
        ProductStatus.active(),
        this.basePrice,
        this.categoryId,
        this.variants,
        this.createdAt,
        new Date(),
      ),
    );
  }

  archive(): Result<Product, ProductNotArchivable> {
    if (!this.status.isActive()) {
      return Result.fail(ProductNotArchivable.create());
    }
    return Result.ok(
      new Product(
        this.id,
        this.name,
        this.description,
        ProductStatus.archived(),
        this.basePrice,
        this.categoryId,
        this.variants,
        this.createdAt,
        new Date(),
      ),
    );
  }

  addVariant(variant: ProductVariant): Result<Product, DuplicateSKU> {
    const duplicate = this.variants.find((v) => v.sku.equals(variant.sku));
    if (duplicate) {
      return Result.fail(DuplicateSKU.create(variant.sku.value));
    }
    return Result.ok(
      new Product(
        this.id,
        this.name,
        this.description,
        this.status,
        this.basePrice,
        this.categoryId,
        [...this.variants, variant],
        this.createdAt,
        new Date(),
      ),
    );
  }

  updatePrice(newPrice: Money): Result<Product, MoneyError> {
    if (this.basePrice.currency !== newPrice.currency) {
      return Result.fail(MoneyError.currencyMismatch(this.basePrice.currency, newPrice.currency));
    }
    return Result.ok(
      new Product(
        this.id,
        this.name,
        this.description,
        this.status,
        newPrice,
        this.categoryId,
        this.variants,
        this.createdAt,
        new Date(),
      ),
    );
  }
}
