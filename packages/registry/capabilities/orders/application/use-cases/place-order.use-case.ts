import { Result } from "../../shared/result.js";
import { Order } from "../../domain/entities/order.entity.js";
import { OrderItem } from "../../domain/entities/order-item.entity.js";
import { Address } from "../../domain/value-objects/address.vo.js";
import { OrderPlaced } from "../../domain/events/order-placed.event.js";
import type { IOrderRepository } from "../ports/order-repository.port.js";
import type { PlaceOrderInput } from "../dto/place-order-input.dto.js";

export class PlaceOrder {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: PlaceOrderInput): Promise<Result<{ orderId: string; event: OrderPlaced }, Error>> {
    if (!input.items || input.items.length === 0) {
      return Result.fail(new Error("Order must have at least one item"));
    }

    const shippingResult = Address.create(input.shippingAddress);
    if (shippingResult.isFail()) {
      return Result.fail(shippingResult.unwrapError());
    }

    const billingResult = Address.create(input.billingAddress);
    if (billingResult.isFail()) {
      return Result.fail(billingResult.unwrapError());
    }

    const orderItems: OrderItem[] = [];
    for (const itemInput of input.items) {
      const itemResult = OrderItem.create({
        id: crypto.randomUUID(),
        productId: itemInput.productId,
        quantity: itemInput.quantity,
        unitPriceCents: itemInput.unitPriceCents,
      });
      if (itemResult.isFail()) {
        return Result.fail(itemResult.unwrapError());
      }
      orderItems.push(itemResult.unwrap());
    }

    const orderId = crypto.randomUUID();
    const orderResult = Order.create({
      id: orderId,
      items: orderItems,
      shippingAddress: shippingResult.unwrap(),
      billingAddress: billingResult.unwrap(),
    });
    if (orderResult.isFail()) {
      return Result.fail(orderResult.unwrapError());
    }

    const order = orderResult.unwrap();
    await this.orderRepository.save(order);

    const event = new OrderPlaced(order.id, order.totalCents, order.itemCount);
    return Result.ok({ orderId: order.id, event });
  }
}
