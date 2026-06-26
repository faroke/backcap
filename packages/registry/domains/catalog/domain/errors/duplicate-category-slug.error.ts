export class DuplicateCategorySlug extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateCategorySlug";
  }

  static create(slug: string): DuplicateCategorySlug {
    return new DuplicateCategorySlug(`Category with slug "${slug}" already exists`);
  }
}
