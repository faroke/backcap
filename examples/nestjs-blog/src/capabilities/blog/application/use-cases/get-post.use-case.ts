import { Result } from "../../shared/result";
import { PostNotFound } from "../../domain/errors/post-not-found.error.js";
import type { IPostRepository } from "../ports/post-repository.port.js";
import type { GetPostInput, GetPostOutput } from "../dto/get-post.dto.js";

export class GetPost {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(input: GetPostInput): Promise<Result<GetPostOutput, Error>> {
    const post = await this.postRepository.findById(input.postId);
    if (!post) {
      return Result.fail(PostNotFound.create(input.postId));
    }

    return Result.ok({
      postId: post.id,
      title: post.title,
      slug: post.slug.value,
      content: post.content,
      authorId: post.authorId,
      status: post.status,
      createdAt: post.createdAt,
      publishedAt: post.publishedAt,
    });
  }
}
