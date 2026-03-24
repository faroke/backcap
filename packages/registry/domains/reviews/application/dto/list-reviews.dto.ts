export interface ListReviewsInput {
  resourceId: string;
  resourceType: string;
  moderationStatus?: "pending" | "approved" | "rejected";
  limit?: number;
  offset?: number;
}

export interface ListReviewsOutput {
  reviews: Array<{
    reviewId: string;
    rating: number;
    body: string | undefined;
    authorId: string;
    moderationStatus: string;
    createdAt: Date;
  }>;
  total: number;
}
