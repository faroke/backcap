export class InvitationExpired extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvitationExpired";
  }

  static create(): InvitationExpired {
    return new InvitationExpired("Invitation has expired");
  }
}
