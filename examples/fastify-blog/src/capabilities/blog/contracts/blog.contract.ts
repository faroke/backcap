import type { Result } from "../shared/result.js";
import type { CreatePostInput, CreatePostOutput } from "../application/dto/create-post.dto.js";
import type { PublishPostInput, PublishPostOutput } from "../application/dto/publish-post.dto.js";
import type { GetPostInput, GetPostOutput } from "../application/dto/get-post.dto.js";
import type { ListPostsInput, ListPostsOutput } from "../application/dto/list-posts.dto.js";

export type { CreatePostInput, CreatePostOutput };
export type { PublishPostInput, PublishPostOutput };
export type { GetPostInput, GetPostOutput };
export type { ListPostsInput, ListPostsOutput };

export interface IBlogService {
  createPost(input: CreatePostInput): Promise<Result<CreatePostOutput, Error>>;
  publishPost(input: PublishPostInput): Promise<Result<PublishPostOutput, Error>>;
  getPost(input: GetPostInput): Promise<Result<GetPostOutput, Error>>;
  listPosts(input: ListPostsInput): Promise<Result<ListPostsOutput, Error>>;
}
