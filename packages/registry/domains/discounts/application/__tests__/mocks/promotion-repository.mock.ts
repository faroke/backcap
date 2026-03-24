import type { Promotion } from "../../../domain/entities/promotion.entity.js";
import type { IPromotionRepository } from "../../ports/promotion-repository.port.js";

export class InMemoryPromotionRepository implements IPromotionRepository {
  private store = new Map<string, Promotion>();

  async findById(id: string): Promise<Promotion | null> {
    return this.store.get(id) ?? null;
  }

  async findActive(): Promise<Promotion[]> {
    return [...this.store.values()].filter((p) => p.status.isActive());
  }

  async findAll(): Promise<Promotion[]> {
    return [...this.store.values()];
  }

  async save(promotion: Promotion): Promise<void> {
    this.store.set(promotion.id, promotion);
  }
}
