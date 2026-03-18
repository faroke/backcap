import type { Subscription } from "../../../domain/entities/subscription.entity.js";
import type { ISubscriptionRepository } from "../../ports/subscription-repository.port.js";

export class InMemorySubscriptionRepository implements ISubscriptionRepository {
  private store = new Map<string, Subscription>();

  async findById(id: string): Promise<Subscription | null> {
    return this.store.get(id) ?? null;
  }

  async findByCustomerId(customerId: string): Promise<Subscription[]> {
    return [...this.store.values()].filter((s) => s.customerId === customerId);
  }

  async save(subscription: Subscription): Promise<void> {
    this.store.set(subscription.id, subscription);
  }
}
