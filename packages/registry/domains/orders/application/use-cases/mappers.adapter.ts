import type { Order } from "../../domain/entities/order.entity.js";
import type { Address } from "../../domain/value-objects/address.vo.js";
import type { OrderOutput, OrderItemOutput, AddressOutput } from "../dto/order-output.dto.js";

export function toAddressOutput(address: Address): AddressOutput {
  return {
    street: address.street,
    city: address.city,
    country: address.country,
    postalCode: address.postalCode,
  };
}

export function toOrderOutput(order: Order): OrderOutput {
  return {
    id: order.id,
    status: order.status.value,
    items: order.items.map(
      (item): OrderItemOutput => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotal: item.lineTotal,
      }),
    ),
    shippingAddress: toAddressOutput(order.shippingAddress),
    billingAddress: toAddressOutput(order.billingAddress),
    totalCents: order.totalCents,
    itemCount: order.itemCount,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
