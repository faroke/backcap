export class UserNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserNotFound";
  }

  static create(userId: string): UserNotFound {
    return new UserNotFound(`User not found with id: "${userId}"`);
  }
}
