import { Result } from "../../shared/result.js";
// Slug: lowercase alphanumeric + hyphens, 3-63 chars, no leading/trailing hyphens
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

export class OrgSlug {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<OrgSlug, Error> {
    const normalized = value.toLowerCase().trim();
    if (!SLUG_REGEX.test(normalized)) {
      return Result.fail(
        new Error(
          `Invalid organization slug: "${value}". Must be 3-63 lowercase alphanumeric characters or hyphens, cannot start or end with a hyphen.`,
        ),
      );
    }
    return Result.ok(new OrgSlug(normalized));
  }

  equals(other: OrgSlug): boolean {
    return this.value === other.value;
  }
}
