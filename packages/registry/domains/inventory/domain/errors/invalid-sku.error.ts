export class InvalidSku extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSku";
  }

  static create(): InvalidSku {
    return new InvalidSku("SKU cannot be empty");
  }
}
