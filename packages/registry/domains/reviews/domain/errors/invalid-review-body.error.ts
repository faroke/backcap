export class InvalidReviewBody extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidReviewBody";
  }

  static create(length: number): InvalidReviewBody {
    return new InvalidReviewBody(
      `Review body must be between 1 and 5,000 characters after trimming. Got ${length}.`,
    );
  }
}
