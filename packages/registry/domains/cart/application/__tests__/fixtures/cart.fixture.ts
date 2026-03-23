import { Cart } from "../../../domain/entities/cart.entity.js";

export function createTestCart(
  overrides?: Partial<{
    id: string;
    userId: string | null;
    status: string;
    maxItems: number;
    currency: string;
  }>,
): Cart {
  const result = Cart.create({
    id: overrides?.id ?? "test-cart-1",
    userId: overrides?.userId ?? null,
    status: overrides?.status ?? "active",
    maxItems: overrides?.maxItems ?? 50,
    currency: overrides?.currency ?? "USD",
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test cart: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
