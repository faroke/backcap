export class TagAlreadyExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TagAlreadyExists";
  }

  static create(slug: string): TagAlreadyExists {
    return new TagAlreadyExists(`Tag already exists with slug: "${slug}"`);
  }
}
