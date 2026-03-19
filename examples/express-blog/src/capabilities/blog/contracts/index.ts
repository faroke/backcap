export type {
  IBlogService,
  CreatePostInput,
  CreatePostOutput,
  PublishPostInput,
  PublishPostOutput,
  GetPostInput,
  GetPostOutput,
  ListPostsInput,
  ListPostsOutput,
} from "./blog.contract.js";

export { createBlogService } from "./blog.factory.js";
export type { BlogServiceDeps } from "./blog.factory.js";
