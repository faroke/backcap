export class InvalidAction extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAction";
  }

  static create(value: string): InvalidAction {
    return new InvalidAction(
      `Invalid activity action: "${value}". Must be a lowercase kebab-case verb (e.g., "invited", "commented", "uploaded-file")`,
    );
  }
}
