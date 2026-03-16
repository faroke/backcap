export class TagNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TagNotFound";
  }

  static create(slug: string): TagNotFound {
    return new TagNotFound(`Tag not found: "${slug}"`);
  }
}
