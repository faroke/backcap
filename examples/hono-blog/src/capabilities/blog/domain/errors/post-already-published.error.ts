export class PostAlreadyPublished extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PostAlreadyPublished";
  }

  static create(postId: string): PostAlreadyPublished {
    return new PostAlreadyPublished(`Post with id "${postId}" is already published.`);
  }
}
