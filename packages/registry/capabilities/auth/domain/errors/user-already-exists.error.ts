export class UserAlreadyExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserAlreadyExists";
  }

  static create(email: string): UserAlreadyExists {
    return new UserAlreadyExists(`User already exists with email: "${email}"`);
  }
}
