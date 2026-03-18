import { Result } from "../../shared/result.js";
import { OrderNotFound } from "../../domain/errors/order-not-found.error.js";
import { OrderConfirmed } from "../../domain/events/order-confirmed.event.js";
import type { IOrderRepository } from "../ports/order-repository.port.js";

export class ConfirmOrder {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string): Promise<Result<{ event: OrderConfirmed }, Error>> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return Result.fail(OrderNotFound.create(orderId));
    }

    const confirmResult = order.confirm();
    if (confirmResult.isFail()) {
      return Result.fail(confirmResult.unwrapError());
    }

    const confirmed = confirmResult.unwrap();
    await this.orderRepository.update(confirmed);

    const event = new OrderConfirmed(confirmed.id);
    return Result.ok({ event });
  }
}
