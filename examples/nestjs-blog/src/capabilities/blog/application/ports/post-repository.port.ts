import type { Post } from "../../domain/entities/post.entity.js";

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findBySlug(slug: string): Promise<Post | null>;
  findAll(filter?: { authorId?: string; status?: "draft" | "published" }): Promise<Post[]>;
  save(post: Post): Promise<void>;
}
