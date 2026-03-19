import type { IPostRepository } from "../application/ports/post-repository.port.js";
import { CreatePost } from "../application/use-cases/create-post.use-case.js";
import { PublishPost } from "../application/use-cases/publish-post.use-case.js";
import { GetPost } from "../application/use-cases/get-post.use-case.js";
import { ListPosts } from "../application/use-cases/list-posts.use-case.js";
import type { IBlogService } from "./blog.contract.js";

interface IEventBus {
  publish<T>(eventName: string, event: T): Promise<void>;
}

export type BlogServiceDeps = {
  postRepository: IPostRepository;
  eventBus?: IEventBus;
};

export function createBlogService(deps: BlogServiceDeps): IBlogService {
  const createPost = new CreatePost(deps.postRepository);
  const publishPost = new PublishPost(deps.postRepository);
  const getPost = new GetPost(deps.postRepository);
  const listPosts = new ListPosts(deps.postRepository);

  return {
    createPost: async (input) => {
      const result = await createPost.execute(input);
      if (result.isOk() && deps.eventBus) {
        await deps.eventBus.publish("PostCreated", result.unwrap().event);
      }
      return result.map((v) => v.output);
    },
    publishPost: async (input) => {
      const result = await publishPost.execute(input);
      if (result.isOk() && deps.eventBus) {
        const { event } = result.unwrap();
        // Enrich event with full post data for bridge consumers
        const postResult = await getPost.execute({ postId: input.postId });
        const post = postResult.isOk() ? postResult.unwrap() : null;
        await deps.eventBus.publish("PostPublished", {
          postId: event.postId,
          title: post?.title ?? "",
          slug: event.slug,
          content: post?.content ?? "",
          authorId: post?.authorId ?? "",
          publishedAt: event.publishedAt.toISOString(),
        });
      }
      return result.map((v) => v.output);
    },
    getPost: (input) => getPost.execute(input),
    listPosts: (input) => listPosts.execute(input),
  };
}
