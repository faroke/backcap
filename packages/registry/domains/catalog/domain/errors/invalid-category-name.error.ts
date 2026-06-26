export class InvalidCategoryName extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCategoryName";
  }

  static empty(): InvalidCategoryName {
    return new InvalidCategoryName("Category name cannot be empty");
  }
}
