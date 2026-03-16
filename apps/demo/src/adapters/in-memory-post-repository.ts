/**
 * In-memory implementation of IPostRepository for demo purposes.
 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  status: "draft" | "published";
  createdAt: Date;
  publishedAt: Date | null;
}

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findBySlug(slug: string): Promise<Post | null>;
  findAll(filter?: { authorId?: string; status?: "draft" | "published" }): Promise<Post[]>;
  save(post: Post): Promise<void>;
}

export class InMemoryPostRepository implements IPostRepository {
  private posts = new Map<string, Post>();

  async findById(id: string): Promise<Post | null> {
    return this.posts.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Post | null> {
    for (const post of this.posts.values()) {
      if (post.slug === slug) return post;
    }
    return null;
  }

  async findAll(filter?: { authorId?: string; status?: "draft" | "published" }): Promise<Post[]> {
    let results = [...this.posts.values()];
    if (filter?.authorId) {
      results = results.filter((p) => p.authorId === filter.authorId);
    }
    if (filter?.status) {
      results = results.filter((p) => p.status === filter.status);
    }
    return results;
  }

  async save(post: Post): Promise<void> {
    this.posts.set(post.id, post);
  }
}
