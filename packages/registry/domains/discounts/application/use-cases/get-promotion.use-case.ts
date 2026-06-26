import { Result } from "../../shared/result.js";
import type { Promotion } from "../../domain/entities/promotion.entity.js";
import { PromotionNotFound } from "../../domain/errors/promotion-not-found.error.js";
import type { IPromotionRepository } from "../ports/promotion-repository.port.js";

export class GetPromotion {
  constructor(private readonly promotionRepository: IPromotionRepository) {}

  async execute(promotionId: string): Promise<Result<Promotion, PromotionNotFound>> {
    const promotion = await this.promotionRepository.findById(promotionId);
    if (!promotion) {
      return Result.fail(PromotionNotFound.create(promotionId));
    }
    return Result.ok(promotion);
  }
}
