export class InvalidDisplayName extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDisplayName";
  }

  static create(value: string): InvalidDisplayName {
    return new InvalidDisplayName(
      `Invalid display name: "${value}". Must be 1-100 characters.`,
    );
  }
}
