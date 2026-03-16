export class UnauthorizedDelete extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedDelete";
  }

  static create(requesterId: string, commentId: string): UnauthorizedDelete {
    return new UnauthorizedDelete(
      `User "${requesterId}" is not authorized to delete comment "${commentId}"`,
    );
  }
}
