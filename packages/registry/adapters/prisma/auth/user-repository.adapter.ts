// Template: import type { IUserRepository } from "{{cap_rel}}/auth/application/ports/user-repository.port.js";
import type { IUserRepository } from "../../../capabilities/auth/application/ports/user-repository.port.js";
// Template: import { User } from "{{cap_rel}}/auth/domain/entities/user.entity.js";
import { User } from "../../../capabilities/auth/domain/entities/user.entity.js";

interface PrismaUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaUserDelegate {
  findUnique(args: { where: { id?: string; email?: string } }): Promise<PrismaUserRecord | null>;
  create(args: { data: PrismaUserRecord }): Promise<PrismaUserRecord>;
  update(args: { where: { id: string }; data: Partial<PrismaUserRecord> }): Promise<PrismaUserRecord>;
}

interface PrismaClient {
  user: PrismaUserDelegate;
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async save(user: User): Promise<void> {
    const data = this.toPrisma(user);
    await this.prisma.user.create({ data });
  }

  private toDomain(record: PrismaUserRecord): User {
    const result = User.create({
      id: record.id,
      email: record.email,
      passwordHash: record.passwordHash,
      roles: record.roles,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
    // Data from DB is trusted; unwrap safely
    return result.unwrap();
  }

  private toPrisma(user: User): PrismaUserRecord {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.passwordHash,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
