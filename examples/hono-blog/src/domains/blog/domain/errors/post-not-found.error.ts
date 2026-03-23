export class PostNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PostNotFound";
  }

  static create(postId: string): PostNotFound {
    return new PostNotFound(`Post not found with id: "${postId}"`);
  }
}
