import { Order } from "../../../domain/entities/order.entity.js";
import { OrderItem } from "../../../domain/entities/order-item.entity.js";
import { Address } from "../../../domain/value-objects/address.vo.js";

export const defaultShippingAddress = Address.create({
  street: "123 Main St",
  city: "Paris",
  country: "France",
  postalCode: "75001",
}).unwrap();

export const defaultBillingAddress = Address.create({
  street: "456 Billing Ave",
  city: "Lyon",
  country: "France",
  postalCode: "69001",
}).unwrap();

export function createTestOrderItem(
  overrides?: Partial<{ id: string; productId: string; quantity: number; unitPriceCents: number }>,
): OrderItem {
  const result = OrderItem.create({
    id: overrides?.id ?? "test-item-1",
    productId: overrides?.productId ?? "prod-1",
    quantity: overrides?.quantity ?? 2,
    unitPriceCents: overrides?.unitPriceCents ?? 1000,
  });
  if (result.isFail()) {
    throw new Error(`Failed to create test order item: ${result.unwrapError().message}`);
  }
  return result.unwrap();
}

export function createTestOrder(
  overrides?: Partial<{ id: string; items: OrderItem[]; status: string; shippingAddress: Address; billingAddress: Address }>,
): Order {
  const result = Order.create({
    id: overrides?.id ?? "test-order-1",
    items: overrides?.items ?? [createTestOrderItem()],
    status: overrides?.status,
    shippingAddress: overrides?.shippingAddress ?? defaultShippingAddress,
    billingAddress: overrides?.billingAddress ?? defaultBillingAddress,
  });
  if (result.isFail()) {
    throw new Error(`Failed to create test order: ${result.unwrapError().message}`);
  }
  return result.unwrap();
}
