import { Result } from "../../shared/result";
import type { IPostRepository } from "../ports/post-repository.port.js";
import type { ListPostsInput, ListPostsOutput } from "../dto/list-posts.dto.js";

export class ListPosts {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(input: ListPostsInput): Promise<Result<ListPostsOutput, Error>> {
    const posts = await this.postRepository.findAll({
      authorId: input.authorId,
      status: input.status,
    });

    return Result.ok({
      posts: posts.map((post) => ({
        postId: post.id,
        title: post.title,
        slug: post.slug.value,
        authorId: post.authorId,
        status: post.status,
        createdAt: post.createdAt,
        publishedAt: post.publishedAt,
      })),
    });
  }
}
