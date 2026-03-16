import type { IPostRepository } from "../application/ports/post-repository.port.js";
import { CreatePost } from "../application/use-cases/create-post.use-case.js";
import { PublishPost } from "../application/use-cases/publish-post.use-case.js";
import { GetPost } from "../application/use-cases/get-post.use-case.js";
import { ListPosts } from "../application/use-cases/list-posts.use-case.js";
import type { IBlogService } from "./blog.contract.js";

export type BlogServiceDeps = {
  postRepository: IPostRepository;
};

export function createBlogService(deps: BlogServiceDeps): IBlogService {
  const createPost = new CreatePost(deps.postRepository);
  const publishPost = new PublishPost(deps.postRepository);
  const getPost = new GetPost(deps.postRepository);
  const listPosts = new ListPosts(deps.postRepository);

  return {
    createPost: (input) =>
      createPost.execute(input).then((r) => r.map((v) => v.output)),
    publishPost: (input) =>
      publishPost.execute(input).then((r) => r.map((v) => v.output)),
    getPost: (input) => getPost.execute(input),
    listPosts: (input) => listPosts.execute(input),
  };
}
