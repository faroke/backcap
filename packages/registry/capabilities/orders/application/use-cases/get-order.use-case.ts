import { Result } from "../../shared/result.js";
import { OrderNotFound } from "../../domain/errors/order-not-found.error.js";
import type { IOrderRepository } from "../ports/order-repository.port.js";
import type { OrderOutput } from "../dto/order-output.dto.js";
import { toOrderOutput } from "./mappers.js";

export class GetOrder {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string): Promise<Result<OrderOutput, Error>> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return Result.fail(OrderNotFound.create(orderId));
    }

    return Result.ok(toOrderOutput(order));
  }
}
