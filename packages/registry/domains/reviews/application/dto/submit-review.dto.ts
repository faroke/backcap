export interface SubmitReviewInput {
  rating: number;
  body?: string;
  authorId: string;
  resourceId: string;
  resourceType: string;
}

export interface SubmitReviewOutput {
  reviewId: string;
  createdAt: Date;
}
