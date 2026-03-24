import type { Promotion } from "../../domain/entities/promotion.entity.js";

export interface IPromotionRepository {
  findById(id: string): Promise<Promotion | null>;
  findActive(): Promise<Promotion[]>;
  findAll(): Promise<Promotion[]>;
  save(promotion: Promotion): Promise<void>;
}
