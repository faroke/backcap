// Template: import type { IPostRepository } from "{{cap_rel}}/blog/application/ports/post-repository.port.js";
import type { IPostRepository } from "../../../capabilities/blog/application/ports/post-repository.port.js";
// Template: import { Post } from "{{cap_rel}}/blog/domain/entities/post.entity.js";
import { Post } from "../../../capabilities/blog/domain/entities/post.entity.js";

interface PrismaPostRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  status: "draft" | "published";
  createdAt: Date;
  publishedAt: Date | null;
}

interface PrismaPostDelegate {
  findUnique(args: { where: { id?: string; slug?: string } }): Promise<PrismaPostRecord | null>;
  findMany(args?: { where?: { authorId?: string; status?: string } }): Promise<PrismaPostRecord[]>;
  create(args: { data: PrismaPostRecord }): Promise<PrismaPostRecord>;
  upsert(args: {
    where: { id: string };
    create: PrismaPostRecord;
    update: Partial<PrismaPostRecord>;
  }): Promise<PrismaPostRecord>;
}

interface PrismaClient {
  post: PrismaPostDelegate;
}

export class PrismaPostRepository implements IPostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Post | null> {
    const record = await this.prisma.post.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const record = await this.prisma.post.findUnique({ where: { slug } });
    return record ? this.toDomain(record) : null;
  }

  async findAll(filter?: { authorId?: string; status?: "draft" | "published" }): Promise<Post[]> {
    const where: Record<string, string> = {};
    if (filter?.authorId) where.authorId = filter.authorId;
    if (filter?.status) where.status = filter.status;

    const records = await this.prisma.post.findMany({ where });
    return records.map((r) => this.toDomain(r));
  }

  async save(post: Post): Promise<void> {
    const data = this.toPrisma(post);
    await this.prisma.post.upsert({
      where: { id: post.id },
      create: data,
      update: data,
    });
  }

  private toDomain(record: PrismaPostRecord): Post {
    const result = Post.create({
      id: record.id,
      title: record.title,
      slug: record.slug,
      content: record.content,
      authorId: record.authorId,
      status: record.status,
    });
    // Data from DB is trusted; unwrap safely
    return result.unwrap();
  }

  private toPrisma(post: Post): PrismaPostRecord {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug.value,
      content: post.content,
      authorId: post.authorId,
      status: post.status,
      createdAt: post.createdAt,
      publishedAt: post.publishedAt,
    };
  }
}
