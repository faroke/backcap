export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
}

export interface IInvitationService {
  create(params: {
    organizationId: string;
    email: string;
    role: string;
    invitedBy: string;
  }): Promise<Invitation>;
  findByToken(token: string): Promise<Invitation | null>;
  markAccepted(id: string): Promise<void>;
}
