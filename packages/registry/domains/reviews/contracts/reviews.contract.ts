import type { Result } from "../shared/result.js";
import type { SubmitReviewInput, SubmitReviewOutput } from "../application/dto/submit-review.dto.js";
import type { ModerateReviewInput, ModerateReviewOutput } from "../application/dto/moderate-review.dto.js";
import type { GetReviewInput, GetReviewOutput } from "../application/dto/get-review.dto.js";
import type { ListReviewsInput, ListReviewsOutput } from "../application/dto/list-reviews.dto.js";
import type {
  GetAggregatedRatingInput,
  GetAggregatedRatingOutput,
} from "../application/dto/get-aggregated-rating.dto.js";
import type { ReviewNotFound } from "../domain/errors/review-not-found.error.js";
import type { ReviewAlreadyModerated } from "../domain/errors/review-already-moderated.error.js";
import type { DuplicateReview } from "../domain/errors/duplicate-review.error.js";
import type { InvalidRating } from "../domain/errors/invalid-rating.error.js";
import type { InvalidReviewBody } from "../domain/errors/invalid-review-body.error.js";

export type { SubmitReviewInput, SubmitReviewOutput };
export type { ModerateReviewInput, ModerateReviewOutput };
export type { GetReviewInput, GetReviewOutput };
export type { ListReviewsInput, ListReviewsOutput };
export type { GetAggregatedRatingInput, GetAggregatedRatingOutput };

export interface IReviewsService {
  submitReview(
    input: SubmitReviewInput,
  ): Promise<Result<SubmitReviewOutput, DuplicateReview | InvalidRating | InvalidReviewBody>>;
  moderateReview(
    input: ModerateReviewInput,
  ): Promise<Result<ModerateReviewOutput, ReviewNotFound | ReviewAlreadyModerated>>;
  getReview(input: GetReviewInput): Promise<Result<GetReviewOutput, ReviewNotFound>>;
  listReviews(input: ListReviewsInput): Promise<Result<ListReviewsOutput, never>>;
  getAggregatedRating(
    input: GetAggregatedRatingInput,
  ): Promise<Result<GetAggregatedRatingOutput, never>>;
}
