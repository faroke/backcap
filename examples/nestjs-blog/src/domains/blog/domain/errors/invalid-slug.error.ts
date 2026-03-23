export class InvalidSlug extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSlug";
  }

  static create(slug: string): InvalidSlug {
    return new InvalidSlug(`Invalid slug: "${slug}". Slug must be lowercase kebab-case (e.g. "my-post-title").`);
  }
}
