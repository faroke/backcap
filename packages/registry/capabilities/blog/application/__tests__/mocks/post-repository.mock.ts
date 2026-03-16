import type { Post } from "../../../domain/entities/post.entity.js";
import type { IPostRepository } from "../../ports/post-repository.port.js";

export class InMemoryPostRepository implements IPostRepository {
  private store = new Map<string, Post>();

  async findById(id: string): Promise<Post | null> {
    return this.store.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return [...this.store.values()].find((p) => p.slug.value === slug) ?? null;
  }

  async findAll(filter?: { authorId?: string; status?: "draft" | "published" }): Promise<Post[]> {
    let posts = [...this.store.values()];
    if (filter?.authorId !== undefined) {
      posts = posts.filter((p) => p.authorId === filter.authorId);
    }
    if (filter?.status !== undefined) {
      posts = posts.filter((p) => p.status === filter.status);
    }
    return posts;
  }

  async save(post: Post): Promise<void> {
    this.store.set(post.id, post);
  }
}
