export class NotAMember extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotAMember";
  }

  static create(userId: string): NotAMember {
    return new NotAMember(`User "${userId}" is not a member of this organization`);
  }
}
