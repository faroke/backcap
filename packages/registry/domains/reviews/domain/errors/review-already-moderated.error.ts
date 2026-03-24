export class ReviewAlreadyModerated extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewAlreadyModerated";
  }

  static create(reviewId: string, currentStatus: string): ReviewAlreadyModerated {
    return new ReviewAlreadyModerated(
      `Review "${reviewId}" is already moderated with status "${currentStatus}"`,
    );
  }
}
