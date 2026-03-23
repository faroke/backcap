import type { Product } from "../../domain/entities/product.entity.js";
import type { Category } from "../../domain/entities/category.entity.js";
import type { ProductOutput, ProductVariantOutput } from "../dto/product-output.dto.js";
import type { CategoryOutput } from "../dto/category-output.dto.js";

export function toProductOutput(product: Product): ProductOutput {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    status: product.status.value,
    basePriceCents: product.basePrice.cents,
    currency: product.basePrice.currency,
    categoryId: product.categoryId,
    variants: product.variants.map(
      (v): ProductVariantOutput => ({
        id: v.id,
        sku: v.sku.value,
        priceCents: v.price.cents,
        currency: v.price.currency,
        attributes: v.attributes,
      }),
    ),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function toCategoryOutput(category: Category): CategoryOutput {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
