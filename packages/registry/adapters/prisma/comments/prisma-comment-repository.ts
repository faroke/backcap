// Template: import type { ICommentRepository, CommentFilters } from "{{cap_rel}}/comments/application/ports/comment-repository.port.js";
import type { ICommentRepository, CommentFilters } from "../../../capabilities/comments/application/ports/comment-repository.port.js";
// Template: import { Comment } from "{{cap_rel}}/comments/domain/entities/comment.entity.js";
import { Comment } from "../../../capabilities/comments/domain/entities/comment.entity.js";

interface PrismaCommentRecord {
  id: string;
  content: string;
  authorId: string;
  resourceId: string;
  resourceType: string;
  parentId: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

interface PrismaCommentDelegate {
  findUnique(args: { where: { id: string } }): Promise<PrismaCommentRecord | null>;
  findMany(args?: {
    where?: Record<string, unknown>;
    skip?: number;
    take?: number;
  }): Promise<PrismaCommentRecord[]>;
  count(args?: { where?: Record<string, unknown> }): Promise<number>;
  upsert(args: {
    where: { id: string };
    create: PrismaCommentRecord;
    update: Partial<PrismaCommentRecord>;
  }): Promise<PrismaCommentRecord>;
}

interface PrismaClient {
  commentRecord: PrismaCommentDelegate;
}

export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(comment: Comment): Promise<void> {
    const data = this.toPrisma(comment);
    await this.prisma.commentRecord.upsert({
      where: { id: comment.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Comment | undefined> {
    const record = await this.prisma.commentRecord.findUnique({ where: { id } });
    return record ? this.toDomain(record) : undefined;
  }

  async findByResource(
    resourceId: string,
    resourceType: string,
    filters: CommentFilters,
  ): Promise<{ comments: Comment[]; total: number }> {
    const where: Record<string, unknown> = { resourceId, resourceType };
    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    const [records, total] = await Promise.all([
      this.prisma.commentRecord.findMany({
        where,
        skip: filters.offset,
        take: filters.limit,
      }),
      this.prisma.commentRecord.count({ where }),
    ]);

    return {
      comments: records.map((r) => this.toDomain(r)),
      total,
    };
  }

  private toDomain(record: PrismaCommentRecord): Comment {
    const result = Comment.create({
      id: record.id,
      content: record.content,
      authorId: record.authorId,
      resourceId: record.resourceId,
      resourceType: record.resourceType,
      parentId: record.parentId ?? undefined,
      createdAt: record.createdAt,
      deletedAt: record.deletedAt ?? undefined,
    });
    if (result.isFail()) {
      throw new Error(`Corrupted comment record ${record.id}: ${result.unwrapError().message}`);
    }
    return result.unwrap();
  }

  private toPrisma(comment: Comment): PrismaCommentRecord {
    return {
      id: comment.id,
      content: comment.content.value,
      authorId: comment.authorId,
      resourceId: comment.resourceId,
      resourceType: comment.resourceType,
      parentId: comment.parentId ?? null,
      createdAt: comment.createdAt,
      deletedAt: comment.deletedAt ?? null,
    };
  }
}
