import { Result } from "../../shared/result.js";
import { InvalidOrgSlug } from "../errors/invalid-org-slug.error.js";
// Slug: lowercase alphanumeric + hyphens, 3-63 chars, no leading/trailing hyphens
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

export class OrgSlug {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<OrgSlug, InvalidOrgSlug> {
    const normalized = value.toLowerCase().trim();
    if (!SLUG_REGEX.test(normalized)) {
      return Result.fail(InvalidOrgSlug.create(value));
    }
    return Result.ok(new OrgSlug(normalized));
  }

  equals(other: OrgSlug): boolean {
    return this.value === other.value;
  }
}
