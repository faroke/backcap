export class ProfileNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileNotFound";
  }

  static create(userId: string): ProfileNotFound {
    return new ProfileNotFound(`Profile not found for user: "${userId}"`);
  }
}
