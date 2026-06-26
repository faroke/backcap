export class InvalidOrgSlug extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOrgSlug";
  }

  static create(slug: string): InvalidOrgSlug {
    return new InvalidOrgSlug(
      `Invalid organization slug: "${slug}". Must be 3-63 lowercase alphanumeric characters or hyphens, cannot start or end with a hyphen.`,
    );
  }
}
