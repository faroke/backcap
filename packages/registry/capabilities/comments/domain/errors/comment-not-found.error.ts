export class CommentNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommentNotFound";
  }

  static create(commentId: string): CommentNotFound {
    return new CommentNotFound(`Comment not found: "${commentId}"`);
  }
}
