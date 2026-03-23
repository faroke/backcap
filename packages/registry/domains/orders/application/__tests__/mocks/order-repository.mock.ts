import type { IOrderRepository } from "../../ports/order-repository.port.js";
import type { Order } from "../../../domain/entities/order.entity.js";

export class InMemoryOrderRepository implements IOrderRepository {
  private store = new Map<string, Order>();

  async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<Order[]> {
    return [...this.store.values()];
  }

  async save(order: Order): Promise<void> {
    this.store.set(order.id, order);
  }

  async update(order: Order): Promise<void> {
    this.store.set(order.id, order);
  }
}
