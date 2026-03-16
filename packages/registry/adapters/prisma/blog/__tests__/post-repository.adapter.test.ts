import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaPostRepository } from "../post-repository.adapter.js";
import { Post } from "../../../../capabilities/blog/domain/entities/post.entity.js";

function createMockPrisma() {
  return {
    post: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
  };
}

const dbRecord = {
  id: "post-1",
  title: "Test Post",
  slug: "test-post",
  content: "Hello world",
  authorId: "author-1",
  status: "draft" as const,
  createdAt: new Date("2024-01-01"),
  publishedAt: null,
};

describe("PrismaPostRepository", () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaPostRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repo = new PrismaPostRepository(prisma);
  });

  it("findById returns post when found", async () => {
    prisma.post.findUnique.mockResolvedValue(dbRecord);
    const post = await repo.findById("post-1");
    expect(post).not.toBeNull();
    expect(post!.id).toBe("post-1");
    expect(post!.slug.value).toBe("test-post");
    expect(prisma.post.findUnique).toHaveBeenCalledWith({ where: { id: "post-1" } });
  });

  it("findById returns null when not found", async () => {
    prisma.post.findUnique.mockResolvedValue(null);
    const post = await repo.findById("missing");
    expect(post).toBeNull();
  });

  it("findBySlug returns post when found", async () => {
    prisma.post.findUnique.mockResolvedValue(dbRecord);
    const post = await repo.findBySlug("test-post");
    expect(post).not.toBeNull();
    expect(prisma.post.findUnique).toHaveBeenCalledWith({ where: { slug: "test-post" } });
  });

  it("findAll returns all posts", async () => {
    prisma.post.findMany.mockResolvedValue([dbRecord]);
    const posts = await repo.findAll();
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe("Test Post");
  });

  it("findAll filters by status", async () => {
    prisma.post.findMany.mockResolvedValue([]);
    await repo.findAll({ status: "published" });
    expect(prisma.post.findMany).toHaveBeenCalledWith({ where: { status: "published" } });
  });

  it("save persists post via upsert", async () => {
    prisma.post.upsert.mockResolvedValue(dbRecord);
    const post = Post.create({
      id: "post-1",
      title: "Test Post",
      slug: "test-post",
      content: "Hello world",
      authorId: "author-1",
    }).unwrap();

    await repo.save(post);
    expect(prisma.post.upsert).toHaveBeenCalledOnce();
    const call = prisma.post.upsert.mock.calls[0]![0];
    expect(call.where.id).toBe("post-1");
    expect(call.create.slug).toBe("test-post");
  });
});
