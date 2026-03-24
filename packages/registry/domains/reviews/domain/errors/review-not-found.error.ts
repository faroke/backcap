export class ReviewNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewNotFound";
  }

  static create(reviewId: string): ReviewNotFound {
    return new ReviewNotFound(`Review not found with id: "${reviewId}"`);
  }
}
