import { Result } from "../../shared/result.js";
import { OrderNotFound } from "../../domain/errors/order-not-found.error.js";
import { OrderCanceled } from "../../domain/events/order-canceled.event.js";
import type { IOrderRepository } from "../ports/order-repository.port.js";

export class CancelOrder {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string): Promise<Result<{ event: OrderCanceled }, Error>> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return Result.fail(OrderNotFound.create(orderId));
    }

    const cancelResult = order.cancel();
    if (cancelResult.isFail()) {
      return Result.fail(cancelResult.unwrapError());
    }

    const canceled = cancelResult.unwrap();
    await this.orderRepository.update(canceled);

    const event = new OrderCanceled(canceled.id);
    return Result.ok({ event });
  }
}
