import { Result } from "../../shared/result.js";
import { Rating } from "../value-objects/rating.vo.js";
import { ReviewBody } from "../value-objects/review-body.vo.js";
import { ModerationStatus } from "../value-objects/moderation-status.vo.js";
import { ReviewAlreadyModerated } from "../errors/review-already-moderated.error.js";
import { InvalidRating } from "../errors/invalid-rating.error.js";
import { InvalidReviewBody } from "../errors/invalid-review-body.error.js";

export class Review {
  readonly id: string;
  readonly rating: Rating;
  readonly body: ReviewBody | undefined;
  readonly authorId: string;
  readonly resourceId: string;
  readonly resourceType: string;
  readonly moderationStatus: ModerationStatus;
  readonly createdAt: Date;
  readonly moderatedAt: Date | undefined;
  readonly moderatorId: string | undefined;

  private constructor(
    id: string,
    rating: Rating,
    body: ReviewBody | undefined,
    authorId: string,
    resourceId: string,
    resourceType: string,
    moderationStatus: ModerationStatus,
    createdAt: Date,
    moderatedAt: Date | undefined,
    moderatorId: string | undefined,
  ) {
    this.id = id;
    this.rating = rating;
    this.body = body;
    this.authorId = authorId;
    this.resourceId = resourceId;
    this.resourceType = resourceType;
    this.moderationStatus = moderationStatus;
    this.createdAt = createdAt;
    this.moderatedAt = moderatedAt;
    this.moderatorId = moderatorId;
  }

  static create(params: {
    id: string;
    rating: number;
    body?: string | undefined;
    authorId: string;
    resourceId: string;
    resourceType: string;
    moderationStatus?: ModerationStatus;
    createdAt?: Date;
    moderatedAt?: Date;
    moderatorId?: string;
  }): Result<Review, InvalidRating | InvalidReviewBody> {
    const ratingResult = Rating.create(params.rating);
    if (ratingResult.isFail()) {
      return Result.fail(ratingResult.unwrapError());
    }

    let bodyVO: ReviewBody | undefined;
    if (params.body !== undefined) {
      const bodyResult = ReviewBody.create(params.body);
      if (bodyResult.isFail()) {
        return Result.fail(bodyResult.unwrapError());
      }
      bodyVO = bodyResult.unwrap();
    }

    return Result.ok(
      new Review(
        params.id,
        ratingResult.unwrap(),
        bodyVO,
        params.authorId,
        params.resourceId,
        params.resourceType,
        params.moderationStatus ?? ModerationStatus.pending(),
        params.createdAt ?? new Date(),
        params.moderatedAt,
        params.moderatorId,
      ),
    );
  }

  approve(moderatorId: string): Result<Review, ReviewAlreadyModerated> {
    if (!this.moderationStatus.isPending()) {
      return Result.fail(
        ReviewAlreadyModerated.create(this.id, this.moderationStatus.value),
      );
    }
    return Result.ok(
      new Review(
        this.id,
        this.rating,
        this.body,
        this.authorId,
        this.resourceId,
        this.resourceType,
        ModerationStatus.approved(),
        this.createdAt,
        new Date(),
        moderatorId,
      ),
    );
  }

  reject(moderatorId: string): Result<Review, ReviewAlreadyModerated> {
    if (!this.moderationStatus.isPending()) {
      return Result.fail(
        ReviewAlreadyModerated.create(this.id, this.moderationStatus.value),
      );
    }
    return Result.ok(
      new Review(
        this.id,
        this.rating,
        this.body,
        this.authorId,
        this.resourceId,
        this.resourceType,
        ModerationStatus.rejected(),
        this.createdAt,
        new Date(),
        moderatorId,
      ),
    );
  }
}
