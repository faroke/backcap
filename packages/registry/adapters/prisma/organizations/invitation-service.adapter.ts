// Template: import type { IInvitationService, Invitation } from "{{cap_rel}}/organizations/application/ports/invitation-service.port.js";
import type {
  IInvitationService,
  Invitation,
} from "../../../capabilities/organizations/application/ports/invitation-service.port.js";

interface PrismaInvitationRecord {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
}

interface PrismaInvitationDelegate {
  create(args: { data: PrismaInvitationRecord }): Promise<PrismaInvitationRecord>;
  findUnique(args: { where: { token?: string; id?: string } }): Promise<PrismaInvitationRecord | null>;
  update(args: { where: { id: string }; data: Partial<PrismaInvitationRecord> }): Promise<PrismaInvitationRecord>;
}

interface PrismaClient {
  invitation: PrismaInvitationDelegate;
}

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class PrismaInvitationService implements IInvitationService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(params: {
    organizationId: string;
    email: string;
    role: string;
    invitedBy: string;
  }): Promise<Invitation> {
    const id = crypto.randomUUID();
    const token = crypto.randomUUID();

    const record = await this.prisma.invitation.create({
      data: {
        id,
        organizationId: params.organizationId,
        email: params.email,
        role: params.role,
        invitedBy: params.invitedBy,
        token,
        expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
        acceptedAt: null,
      },
    });

    return this.toDomain(record);
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const record = await this.prisma.invitation.findUnique({ where: { token } });
    return record ? this.toDomain(record) : null;
  }

  async markAccepted(id: string): Promise<void> {
    await this.prisma.invitation.update({
      where: { id },
      data: { acceptedAt: new Date() },
    });
  }

  private toDomain(record: PrismaInvitationRecord): Invitation {
    return {
      id: record.id,
      organizationId: record.organizationId,
      email: record.email,
      role: record.role,
      invitedBy: record.invitedBy,
      token: record.token,
      expiresAt: record.expiresAt,
      acceptedAt: record.acceptedAt,
    };
  }
}
