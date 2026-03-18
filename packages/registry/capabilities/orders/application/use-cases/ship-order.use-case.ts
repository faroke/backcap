import { Result } from "../../shared/result.js";
import { OrderNotFound } from "../../domain/errors/order-not-found.error.js";
import { OrderShipped } from "../../domain/events/order-shipped.event.js";
import type { IOrderRepository } from "../ports/order-repository.port.js";

export class ShipOrder {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string): Promise<Result<{ event: OrderShipped }, Error>> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return Result.fail(OrderNotFound.create(orderId));
    }

    const shipResult = order.ship();
    if (shipResult.isFail()) {
      return Result.fail(shipResult.unwrapError());
    }

    const shipped = shipResult.unwrap();
    await this.orderRepository.update(shipped);

    const event = new OrderShipped(shipped.id);
    return Result.ok({ event });
  }
}
