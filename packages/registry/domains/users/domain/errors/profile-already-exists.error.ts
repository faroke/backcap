export class ProfileAlreadyExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileAlreadyExists";
  }

  static create(userId: string): ProfileAlreadyExists {
    return new ProfileAlreadyExists(
      `Profile already exists for user: "${userId}"`,
    );
  }
}
