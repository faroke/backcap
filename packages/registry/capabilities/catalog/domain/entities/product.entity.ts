import { Result } from "../../shared/result.js";
import { Money } from "../value-objects/money.vo.js";
import { ProductStatus } from "../value-objects/product-status.vo.js";
import { ProductVariant } from "./product-variant.entity.js";
import { DuplicateSKU } from "../errors/duplicate-sku.error.js";

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
    currency?: string;
    status?: string;
    categoryId?: string | null;
    variants?: ProductVariant[];
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<Product, Error> {
    if (!params.name || typeof params.name !== "string" || params.name.trim().length === 0) {
      return Result.fail(new Error("Product name cannot be empty"));
    }
    if (params.name.trim().length > 500) {
      return Result.fail(new Error("Product name cannot exceed 500 characters"));
    }

    if (params.description == null || typeof params.description !== "string") {
      return Result.fail(new Error("Product description is required"));
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

  publish(): Result<Product, Error> {
    if (!this.status.isDraft()) {
      return Result.fail(new Error("Only draft products can be published"));
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

  archive(): Result<Product, Error> {
    if (!this.status.isActive()) {
      return Result.fail(new Error("Only active products can be archived"));
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

  updatePrice(newPrice: Money): Result<Product, Error> {
    if (this.basePrice.currency !== newPrice.currency) {
      return Result.fail(new Error(`Cannot change product currency from ${this.basePrice.currency} to ${newPrice.currency}`));
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
