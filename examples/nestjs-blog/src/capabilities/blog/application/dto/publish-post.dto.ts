export interface PublishPostInput {
  postId: string;
}

export interface PublishPostOutput {
  postId: string;
  slug: string;
  publishedAt: Date;
}
