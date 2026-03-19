import { Result } from "../../shared/result";
import { Slug } from "../value-objects/slug.vo.js";
import { InvalidSlug } from "../errors/invalid-slug.error.js";
import { PostAlreadyPublished } from "../errors/post-already-published.error.js";
import { PostPublished } from "../events/post-published.event.js";

export type PostStatus = "draft" | "published";

export class Post {
  readonly id: string;
  readonly title: string;
  readonly slug: Slug;
  readonly content: string;
  readonly authorId: string;
  readonly status: PostStatus;
  readonly createdAt: Date;
  readonly publishedAt: Date | null;

  private constructor(
    id: string,
    title: string,
    slug: Slug,
    content: string,
    authorId: string,
    status: PostStatus,
    createdAt: Date,
    publishedAt: Date | null,
  ) {
    this.id = id;
    this.title = title;
    this.slug = slug;
    this.content = content;
    this.authorId = authorId;
    this.status = status;
    this.createdAt = createdAt;
    this.publishedAt = publishedAt;
  }

  static create(params: {
    id: string;
    title: string;
    slug?: string;
    content: string;
    authorId: string;
    status?: PostStatus;
    createdAt?: Date;
    publishedAt?: Date | null;
  }): Result<Post, InvalidSlug> {
    const slugResult = params.slug
      ? Slug.create(params.slug)
      : Slug.fromTitle(params.title);

    if (slugResult.isFail()) {
      return Result.fail(slugResult.unwrapError());
    }

    const now = new Date();
    return Result.ok(
      new Post(
        params.id,
        params.title,
        slugResult.unwrap(),
        params.content,
        params.authorId,
        params.status ?? "draft",
        params.createdAt ?? now,
        params.publishedAt ?? null,
      ),
    );
  }

  publish(): Result<{ post: Post; event: PostPublished }, PostAlreadyPublished> {
    if (this.status === "published") {
      return Result.fail(PostAlreadyPublished.create(this.id));
    }

    const publishedAt = new Date();
    const updatedPost = new Post(
      this.id,
      this.title,
      this.slug,
      this.content,
      this.authorId,
      "published",
      this.createdAt,
      publishedAt,
    );

    const event = new PostPublished(this.id, this.slug.value, publishedAt);

    return Result.ok({ post: updatedPost, event });
  }
}
