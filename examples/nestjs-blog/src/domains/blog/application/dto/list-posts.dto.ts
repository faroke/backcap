export interface ListPostsInput {
  authorId?: string;
  status?: "draft" | "published";
}

export interface ListPostsOutputItem {
  postId: string;
  title: string;
  slug: string;
  authorId: string;
  status: "draft" | "published";
  createdAt: Date;
  publishedAt: Date | null;
}

export interface ListPostsOutput {
  posts: ListPostsOutputItem[];
}
