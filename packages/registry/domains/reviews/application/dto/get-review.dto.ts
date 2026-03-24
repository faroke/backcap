export interface GetReviewInput {
  reviewId: string;
}

export interface GetReviewOutput {
  reviewId: string;
  rating: number;
  body: string | undefined;
  authorId: string;
  resourceId: string;
  resourceType: string;
  moderationStatus: string;
  createdAt: Date;
  moderatedAt: Date | undefined;
  moderatorId: string | undefined;
}
