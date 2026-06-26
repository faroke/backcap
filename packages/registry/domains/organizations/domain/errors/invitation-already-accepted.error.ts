export class InvitationAlreadyAccepted extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvitationAlreadyAccepted";
  }

  static create(): InvitationAlreadyAccepted {
    return new InvitationAlreadyAccepted("Invitation has already been accepted");
  }
}
