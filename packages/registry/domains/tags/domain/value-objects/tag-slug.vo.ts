import { Result } from "../../shared/result.js";
import { InvalidTagSlug } from "../errors/invalid-tag-slug.error.js";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class TagSlug {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<TagSlug, InvalidTagSlug> {
    if (!value || value.length > 64 || !SLUG_REGEX.test(value)) {
      return Result.fail(InvalidTagSlug.create(value));
    }
    return Result.ok(new TagSlug(value));
  }

  static fromName(name: string): Result<TagSlug, InvalidTagSlug> {
    const generated = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    return TagSlug.create(generated);
  }
}
