export class InvitationNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvitationNotFound";
  }

  static create(): InvitationNotFound {
    return new InvitationNotFound("Invitation not found or expired");
  }
}
