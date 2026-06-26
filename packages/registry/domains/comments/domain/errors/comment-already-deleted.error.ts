export class CommentAlreadyDeleted extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommentAlreadyDeleted";
  }

  static create(commentId: string): CommentAlreadyDeleted {
    return new CommentAlreadyDeleted(
      `Comment "${commentId}" is already deleted`,
    );
  }
}
