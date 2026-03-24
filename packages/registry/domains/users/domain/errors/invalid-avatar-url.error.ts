export class InvalidAvatarUrl extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAvatarUrl";
  }

  static create(value: string): InvalidAvatarUrl {
    return new InvalidAvatarUrl(`Invalid avatar URL: "${value}"`);
  }
}
