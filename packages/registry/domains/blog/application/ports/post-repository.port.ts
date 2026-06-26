import type { Post } from "../../domain/entities/post.entity.js";

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findBySlug(slug: string): Promise<Post | null>;
  findAll(filter?: {
    authorId?: string | undefined;
    status?: "draft" | "published" | undefined;
  }): Promise<Post[]>;
  save(post: Post): Promise<void>;
}
