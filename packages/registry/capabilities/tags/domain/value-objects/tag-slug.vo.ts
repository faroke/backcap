// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";

const TAG_SLUG_REGEX = /^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$/;

export class TagSlug {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<TagSlug, Error> {
    if (value.length < 1 || value.length > 64) {
      return Result.fail(
        new Error(`Tag slug must be 1-64 characters, got ${value.length}`),
      );
    }
    if (!TAG_SLUG_REGEX.test(value)) {
      return Result.fail(
        new Error(
          `Tag slug must be lowercase kebab-case with no leading/trailing hyphens: "${value}"`,
        ),
      );
    }
    return Result.ok(new TagSlug(value));
  }

  static fromName(name: string): Result<TagSlug, Error> {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (slug.length === 0) {
      return Result.fail(new Error(`Cannot generate slug from name: "${name}"`));
    }

    return TagSlug.create(slug);
  }
}
