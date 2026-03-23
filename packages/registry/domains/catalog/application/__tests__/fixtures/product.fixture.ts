import { Product } from "../../../domain/entities/product.entity.js";
import { ProductVariant } from "../../../domain/entities/product-variant.entity.js";

export function createTestProduct(
  overrides?: Partial<{
    id: string;
    name: string;
    description: string;
    basePriceCents: number;
    currency: string;
    status: string;
    categoryId: string | null;
  }>,
): Product {
  const result = Product.create({
    id: overrides?.id ?? "test-prod-1",
    name: overrides?.name ?? "Test Product",
    description: overrides?.description ?? "A test product description",
    basePriceCents: overrides?.basePriceCents ?? 1999,
    currency: overrides?.currency ?? "USD",
    status: overrides?.status ?? "draft",
    categoryId: overrides?.categoryId ?? null,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test product: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}

export function createTestVariant(
  overrides?: Partial<{
    id: string;
    productId: string;
    sku: string;
    priceCents: number;
    currency: string;
    attributes: Record<string, string>;
  }>,
): ProductVariant {
  const result = ProductVariant.create({
    id: overrides?.id ?? "test-var-1",
    productId: overrides?.productId ?? "test-prod-1",
    sku: overrides?.sku ?? "SKU-001",
    priceCents: overrides?.priceCents ?? 2499,
    currency: overrides?.currency ?? "USD",
    attributes: overrides?.attributes ?? {},
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test variant: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
