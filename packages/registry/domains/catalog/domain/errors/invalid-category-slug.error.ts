export class InvalidCategorySlug extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCategorySlug";
  }

  static invalidFormat(value: string): InvalidCategorySlug {
    return new InvalidCategorySlug(
      `Invalid slug format: "${value}". Must be 2-100 lowercase alphanumeric characters with optional hyphens.`,
    );
  }
}
