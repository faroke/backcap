export class InvalidCredentials extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCredentials";
  }

  static create(): InvalidCredentials {
    return new InvalidCredentials("Invalid email or password");
  }
}
