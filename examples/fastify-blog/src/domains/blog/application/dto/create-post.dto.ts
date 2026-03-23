export interface CreatePostInput {
  title: string;
  slug?: string;
  content: string;
  authorId: string;
}

export interface CreatePostOutput {
  postId: string;
  slug: string;
}
