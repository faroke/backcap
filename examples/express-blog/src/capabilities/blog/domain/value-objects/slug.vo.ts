// Template: import { Result } from "../../shared/result";
import { Result } from "../../shared/result.js";
import { InvalidSlug } from "../errors/invalid-slug.error.js";

// Matches lowercase kebab-case: one or more segments of lowercase letters/digits joined by single hyphens
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class Slug {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<Slug, InvalidSlug> {
    if (!SLUG_REGEX.test(value)) {
      return Result.fail(InvalidSlug.create(value));
    }
    return Result.ok(new Slug(value));
  }

  /**
   * Generates a valid kebab-case slug from a human-readable title.
   * e.g. "Hello World! My Post" => "hello-world-my-post"
   */
  static fromTitle(title: string): Result<Slug, InvalidSlug> {
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    return Slug.create(generated);
  }
}
