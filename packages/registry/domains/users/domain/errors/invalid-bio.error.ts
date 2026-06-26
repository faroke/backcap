export class InvalidBio extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidBio";
  }

  static create(length: number): InvalidBio {
    return new InvalidBio(
      `Invalid bio: ${length} characters. Must not exceed 2000 characters.`,
    );
  }
}
