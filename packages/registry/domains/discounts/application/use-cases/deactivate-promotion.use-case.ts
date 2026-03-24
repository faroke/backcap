import { Result } from "../../shared/result.js";
import { PromotionNotFound } from "../../domain/errors/promotion-not-found.error.js";
import { PromotionDeactivated } from "../../domain/events/promotion-deactivated.event.js";
import type { IPromotionRepository } from "../ports/promotion-repository.port.js";

export class DeactivatePromotion {
  constructor(private readonly promotionRepository: IPromotionRepository) {}

  async execute(
    promotionId: string,
  ): Promise<Result<{ event: PromotionDeactivated }, Error>> {
    const promotion = await this.promotionRepository.findById(promotionId);
    if (!promotion) {
      return Result.fail(PromotionNotFound.create(promotionId));
    }

    const deactivateResult = promotion.deactivate();
    if (deactivateResult.isFail()) return Result.fail(deactivateResult.unwrapError());

    await this.promotionRepository.save(deactivateResult.unwrap());

    const event = new PromotionDeactivated(promotionId);
    return Result.ok({ event });
  }
}
