export interface GetPostInput {
  postId: string;
}

export interface GetPostOutput {
  postId: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  status: "draft" | "published";
  createdAt: Date;
  publishedAt: Date | null;
}
