import type { Invitation, IInvitationService } from "../../ports/invitation-service.port.js";

export class InMemoryInvitationService implements IInvitationService {
  private store = new Map<string, Invitation>();
  private tokenIndex = new Map<string, string>();

  async create(params: {
    organizationId: string;
    email: string;
    role: string;
    invitedBy: string;
  }): Promise<Invitation> {
    const id = `inv-${Date.now()}`;
    const token = `token-${id}`;
    const invitation: Invitation = {
      id,
      organizationId: params.organizationId,
      email: params.email,
      role: params.role,
      invitedBy: params.invitedBy,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      acceptedAt: null,
    };
    this.store.set(id, invitation);
    this.tokenIndex.set(token, id);
    return invitation;
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const id = this.tokenIndex.get(token);
    if (!id) return null;
    return this.store.get(id) ?? null;
  }

  async markAccepted(id: string): Promise<void> {
    const invitation = this.store.get(id);
    if (invitation) {
      this.store.set(id, { ...invitation, acceptedAt: new Date() });
    }
  }

  // Test helper: seed an invitation directly
  seed(invitation: Invitation): void {
    this.store.set(invitation.id, invitation);
    this.tokenIndex.set(invitation.token, invitation.id);
  }
}
