export class InvalidTagSlug extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTagSlug";
  }

  static create(slug: string): InvalidTagSlug {
    return new InvalidTagSlug(
      `Invalid tag slug: "${slug}". Must be lowercase kebab-case, 1–64 characters, no leading or trailing hyphens.`,
    );
  }
}
