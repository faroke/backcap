import type { Result } from "../shared/result.js";
import type { SubmitReviewInput, SubmitReviewOutput } from "../application/dto/submit-review.dto.js";
import type { ModerateReviewInput, ModerateReviewOutput } from "../application/dto/moderate-review.dto.js";
import type { GetReviewInput, GetReviewOutput } from "../application/dto/get-review.dto.js";
import type { ListReviewsInput, ListReviewsOutput } from "../application/dto/list-reviews.dto.js";
import type {
  GetAggregatedRatingInput,
  GetAggregatedRatingOutput,
} from "../application/dto/get-aggregated-rating.dto.js";

export type { SubmitReviewInput, SubmitReviewOutput };
export type { ModerateReviewInput, ModerateReviewOutput };
export type { GetReviewInput, GetReviewOutput };
export type { ListReviewsInput, ListReviewsOutput };
export type { GetAggregatedRatingInput, GetAggregatedRatingOutput };

export interface IReviewsService {
  submitReview(input: SubmitReviewInput): Promise<Result<SubmitReviewOutput, Error>>;
  moderateReview(input: ModerateReviewInput): Promise<Result<ModerateReviewOutput, Error>>;
  getReview(input: GetReviewInput): Promise<Result<GetReviewOutput, Error>>;
  listReviews(input: ListReviewsInput): Promise<Result<ListReviewsOutput, Error>>;
  getAggregatedRating(
    input: GetAggregatedRatingInput,
  ): Promise<Result<GetAggregatedRatingOutput, Error>>;
}
