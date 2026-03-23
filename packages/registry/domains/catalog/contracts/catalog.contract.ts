import type { Result } from "../shared/result.js";
import type { ProductOutput } from "../application/dto/product-output.dto.js";
import type { CategoryOutput } from "../application/dto/category-output.dto.js";

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
  createProduct(input: CatalogCreateProductInput): Promise<Result<{ productId: string }, Error>>;
  publishProduct(productId: string): Promise<Result<void, Error>>;
  addVariant(input: CatalogAddVariantInput): Promise<Result<{ variantId: string }, Error>>;
  updatePrice(input: CatalogUpdatePriceInput): Promise<Result<void, Error>>;
  listProducts(): Promise<Result<ProductOutput[], Error>>;
  getProduct(productId: string): Promise<Result<ProductOutput, Error>>;
  createCategory(input: CatalogCreateCategoryInput): Promise<Result<{ categoryId: string }, Error>>;
  listByCategory(categoryId: string): Promise<Result<ProductOutput[], Error>>;
}
