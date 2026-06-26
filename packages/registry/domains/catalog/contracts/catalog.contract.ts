import type { Result } from "../shared/result.js";
import type { ProductOutput } from "../application/dto/product-output.dto.js";
import type { CategoryOutput } from "../application/dto/category-output.dto.js";
import type { ProductNotFound } from "../domain/errors/product-not-found.error.js";
import type { ProductNotPublishable } from "../domain/errors/product-not-publishable.error.js";
import type { DuplicateSKU } from "../domain/errors/duplicate-sku.error.js";
import type { MoneyError } from "../domain/errors/money.error.js";
import type { InvalidSKU } from "../domain/errors/invalid-sku.error.js";
import type { InvalidProductName } from "../domain/errors/invalid-product-name.error.js";
import type { InvalidProductDescription } from "../domain/errors/invalid-product-description.error.js";
import type { InvalidProductStatus } from "../domain/errors/invalid-product-status.error.js";
import type { DuplicateCategorySlug } from "../domain/errors/duplicate-category-slug.error.js";
import type { InvalidCategoryName } from "../domain/errors/invalid-category-name.error.js";
import type { InvalidCategorySlug } from "../domain/errors/invalid-category-slug.error.js";
import type { CategoryNotFound } from "../domain/errors/category-not-found.error.js";

export interface CatalogCreateProductInput {
  name: string;
  description: string;
  basePriceCents: number;
  currency?: string;
  categoryId?: string;
}

export interface CatalogAddVariantInput {
  productId: string;
  sku: string;
  priceCents: number;
  currency?: string;
  attributes?: Record<string, string>;
}

export interface CatalogUpdatePriceInput {
  productId: string;
  priceCents: number;
  currency?: string;
}

export interface CatalogCreateCategoryInput {
  name: string;
  slug: string;
  parentId?: string;
}

export interface ICatalogService {
  createProduct(
    input: CatalogCreateProductInput,
  ): Promise<
    Result<
      { productId: string },
      InvalidProductName | InvalidProductDescription | MoneyError | InvalidProductStatus
    >
  >;
  publishProduct(
    productId: string,
  ): Promise<Result<void, ProductNotFound | ProductNotPublishable>>;
  addVariant(
    input: CatalogAddVariantInput,
  ): Promise<
    Result<{ variantId: string }, ProductNotFound | InvalidSKU | MoneyError | DuplicateSKU>
  >;
  updatePrice(
    input: CatalogUpdatePriceInput,
  ): Promise<Result<void, ProductNotFound | MoneyError>>;
  listProducts(): Promise<Result<ProductOutput[], never>>;
  getProduct(productId: string): Promise<Result<ProductOutput, ProductNotFound>>;
  createCategory(
    input: CatalogCreateCategoryInput,
  ): Promise<
    Result<
      { categoryId: string },
      DuplicateCategorySlug | InvalidCategoryName | InvalidCategorySlug
    >
  >;
  listByCategory(categoryId: string): Promise<Result<ProductOutput[], CategoryNotFound>>;
}
