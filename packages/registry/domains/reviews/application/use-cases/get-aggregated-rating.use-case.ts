import { Result } from "../../shared/result.js";
import { AggregatedRating } from "../../domain/value-objects/aggregated-rating.vo.js";
import type { IReviewRepository } from "../ports/review-repository.port.js";
import type {
  GetAggregatedRatingInput,
  GetAggregatedRatingOutput,
} from "../dto/get-aggregated-rating.dto.js";

export class GetAggregatedRating {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(
    input: GetAggregatedRatingInput,
  ): Promise<Result<GetAggregatedRatingOutput, never>> {
    const distribution = await this.reviewRepository.computeRatingDistribution(
      input.resourceId,
      input.resourceType,
    );

    const aggregated = AggregatedRating.compute(distribution);

    return Result.ok({
      average: aggregated.average,
      count: aggregated.count,
      distribution: aggregated.distribution,
    });
  }
}
