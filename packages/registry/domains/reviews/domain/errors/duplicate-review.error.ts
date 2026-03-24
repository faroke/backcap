export class DuplicateReview extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateReview";
  }

  static create(authorId: string, resourceId: string, resourceType: string): DuplicateReview {
    return new DuplicateReview(
      `Author "${authorId}" has already submitted a review for ${resourceType} "${resourceId}"`,
    );
  }
}
