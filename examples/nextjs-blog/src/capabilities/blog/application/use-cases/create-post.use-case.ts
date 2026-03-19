import { Result } from "../../shared/result";
import { Post } from "../../domain/entities/post.entity.js";
import { PostCreated } from "../../domain/events/post-created.event.js";
import type { IPostRepository } from "../ports/post-repository.port.js";
import type { CreatePostInput, CreatePostOutput } from "../dto/create-post.dto.js";

export class CreatePost {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(
    input: CreatePostInput,
  ): Promise<Result<{ output: CreatePostOutput; event: PostCreated }, Error>> {
    const id = crypto.randomUUID();
    const postResult = Post.create({
      id,
      title: input.title,
      slug: input.slug,
      content: input.content,
      authorId: input.authorId,
    });

    if (postResult.isFail()) {
      return Result.fail(postResult.unwrapError());
    }

    const post = postResult.unwrap();
    await this.postRepository.save(post);

    const event = new PostCreated(post.id, post.authorId);

    return Result.ok({
      output: { postId: post.id, slug: post.slug.value },
      event,
    });
  }
}
