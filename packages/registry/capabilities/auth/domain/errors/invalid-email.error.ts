export class InvalidEmail extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidEmail";
  }

  static create(email: string): InvalidEmail {
    return new InvalidEmail(`Invalid email address: "${email}"`);
  }
}
