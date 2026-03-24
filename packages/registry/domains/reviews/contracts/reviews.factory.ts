import type { IReviewRepository } from "../application/ports/review-repository.port.js";
import { SubmitReview } from "../application/use-cases/submit-review.use-case.js";
import { ModerateReview } from "../application/use-cases/moderate-review.use-case.js";
import { GetReview } from "../application/use-cases/get-review.use-case.js";
import { ListReviews } from "../application/use-cases/list-reviews.use-case.js";
import { GetAggregatedRating } from "../application/use-cases/get-aggregated-rating.use-case.js";
import type { IReviewsService } from "./reviews.contract.js";

interface IEventBus {
  publish<T>(eventName: string, event: T): Promise<void>;
}

export type ReviewsDeps = {
  reviewRepository: IReviewRepository;
  eventBus?: IEventBus;
};

export function createReviewsService(deps: ReviewsDeps): IReviewsService {
  const submitReview = new SubmitReview(deps.reviewRepository);
  const moderateReview = new ModerateReview(deps.reviewRepository);
  const getReview = new GetReview(deps.reviewRepository);
  const listReviews = new ListReviews(deps.reviewRepository);
  const getAggregatedRating = new GetAggregatedRating(deps.reviewRepository);

  return {
    submitReview: async (input) => {
      const result = await submitReview.execute(input);
      if (result.isOk() && deps.eventBus) {
        await deps.eventBus.publish("ReviewSubmitted", result.unwrap().event);
      }
      return result.map((v) => v.output);
    },
    moderateReview: async (input) => {
      const result = await moderateReview.execute(input);
      if (result.isOk() && deps.eventBus) {
        await deps.eventBus.publish("ReviewModerated", result.unwrap().event);
      }
      return result.map((v) => v.output);
    },
    getReview: (input) => getReview.execute(input),
    listReviews: (input) => listReviews.execute(input),
    getAggregatedRating: (input) => getAggregatedRating.execute(input),
  };
}
