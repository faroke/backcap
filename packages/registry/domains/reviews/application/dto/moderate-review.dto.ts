export interface ModerateReviewInput {
  reviewId: string;
  moderatorId: string;
  decision: "approve" | "reject";
}

export interface ModerateReviewOutput {
  moderatedAt: Date;
  newStatus: string;
}
