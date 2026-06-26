import { Result } from "../../shared/result.js";
import type { Promotion } from "../../domain/entities/promotion.entity.js";
import type { IPromotionRepository } from "../ports/promotion-repository.port.js";

export class ListPromotions {
  constructor(private readonly promotionRepository: IPromotionRepository) {}

  async execute(filter?: { activeOnly?: boolean }): Promise<Result<Promotion[], never>> {
    const promotions = filter?.activeOnly
      ? await this.promotionRepository.findActive()
      : await this.promotionRepository.findAll();
    return Result.ok(promotions);
  }
}
