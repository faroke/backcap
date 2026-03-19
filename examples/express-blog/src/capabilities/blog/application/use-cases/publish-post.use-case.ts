// Template: import { Result } from "../../shared/result";
import { Result } from "../../shared/result.js";
import { PostNotFound } from "../../domain/errors/post-not-found.error.js";
import type { IPostRepository } from "../ports/post-repository.port.js";
import type { PublishPostInput, PublishPostOutput } from "../dto/publish-post.dto.js";
import type { PostPublished } from "../../domain/events/post-published.event.js";

export class PublishPost {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(
    input: PublishPostInput,
  ): Promise<Result<{ output: PublishPostOutput; event: PostPublished }, Error>> {
    const post = await this.postRepository.findById(input.postId);
    if (!post) {
      return Result.fail(PostNotFound.create(input.postId));
    }

    const publishResult = post.publish();
    if (publishResult.isFail()) {
      return Result.fail(publishResult.unwrapError());
    }

    const { post: publishedPost, event } = publishResult.unwrap();
    await this.postRepository.save(publishedPost);

    return Result.ok({
      output: {
        postId: publishedPost.id,
        slug: publishedPost.slug.value,
        publishedAt: publishedPost.publishedAt!,
      },
      event,
    });
  }
}
