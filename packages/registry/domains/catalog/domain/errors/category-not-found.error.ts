export class CategoryNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CategoryNotFound";
  }

  static create(categoryId: string): CategoryNotFound {
    return new CategoryNotFound(`Category not found: "${categoryId}"`);
  }
}
