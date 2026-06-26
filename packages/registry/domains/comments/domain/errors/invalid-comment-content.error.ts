export class InvalidCommentContent extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCommentContent";
  }

  static create(length: number): InvalidCommentContent {
    return new InvalidCommentContent(
      `Comment content must be between 1 and 10,000 characters after trimming. Got ${length}.`,
    );
  }
}
