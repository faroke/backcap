import { Result } from "../../shared/result.js";
import { CommentContent } from "../value-objects/comment-content.vo.js";

export class Comment {
  readonly id: string;
  readonly content: CommentContent;
  readonly authorId: string;
  readonly resourceId: string;
  readonly resourceType: string;
  readonly parentId: string | undefined;
  readonly createdAt: Date;
  readonly deletedAt: Date | undefined;

  private constructor(
    id: string,
    content: CommentContent,
    authorId: string,
    resourceId: string,
    resourceType: string,
    parentId: string | undefined,
    createdAt: Date,
    deletedAt: Date | undefined,
  ) {
    this.id = id;
    this.content = content;
    this.authorId = authorId;
    this.resourceId = resourceId;
    this.resourceType = resourceType;
    this.parentId = parentId;
    this.createdAt = createdAt;
    this.deletedAt = deletedAt;
  }

  static create(params: {
    id: string;
    content: string;
    authorId: string;
    resourceId: string;
    resourceType: string;
    parentId?: string;
    createdAt?: Date;
    deletedAt?: Date;
  }): Result<Comment, Error> {
    const contentResult = CommentContent.create(params.content);
    if (contentResult.isFail()) {
      return Result.fail(contentResult.unwrapError());
    }

    return Result.ok(
      new Comment(
        params.id,
        contentResult.unwrap(),
        params.authorId,
        params.resourceId,
        params.resourceType,
        params.parentId,
        params.createdAt ?? new Date(),
        params.deletedAt,
      ),
    );
  }

  softDelete(): Result<Comment, Error> {
    if (this.deletedAt) {
      return Result.fail(new Error("Comment is already deleted"));
    }
    return Result.ok(
      new Comment(
        this.id,
        this.content,
        this.authorId,
        this.resourceId,
        this.resourceType,
        this.parentId,
        this.createdAt,
        new Date(),
      ),
    );
  }
}
