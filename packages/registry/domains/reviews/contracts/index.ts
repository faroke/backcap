export type {
  IReviewsService,
  SubmitReviewInput,
  SubmitReviewOutput,
  ModerateReviewInput,
  ModerateReviewOutput,
  GetReviewInput,
  GetReviewOutput,
  ListReviewsInput,
  ListReviewsOutput,
  GetAggregatedRatingInput,
  GetAggregatedRatingOutput,
} from "./reviews.contract.js";

export { createReviewsService } from "./reviews.factory.js";
export type { ReviewsDeps } from "./reviews.factory.js";
