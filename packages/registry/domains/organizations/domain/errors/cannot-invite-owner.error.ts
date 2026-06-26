export class CannotInviteOwner extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CannotInviteOwner";
  }

  static create(): CannotInviteOwner {
    return new CannotInviteOwner("Cannot invite with owner role");
  }
}
