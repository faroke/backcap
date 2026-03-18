import { Result } from "../../shared/result.js";
import type { IOrderRepository } from "../ports/order-repository.port.js";
import type { OrderOutput } from "../dto/order-output.dto.js";
import { toOrderOutput } from "./mappers.js";

export class ListOrders {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(): Promise<Result<OrderOutput[], Error>> {
    const orders = await this.orderRepository.findAll();
    return Result.ok(orders.map(toOrderOutput));
  }
}
