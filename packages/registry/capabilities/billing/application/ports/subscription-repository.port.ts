import type { Subscription } from "../../domain/entities/subscription.entity.js";

export interface ISubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByExternalId(externalId: string): Promise<Subscription | null>;
  findByCustomerId(customerId: string): Promise<Subscription[]>;
  save(subscription: Subscription): Promise<void>;
}
