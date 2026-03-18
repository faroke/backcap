// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { MemberRole } from "../value-objects/member-role.vo.js";

export class Membership {
  readonly id: string;
  readonly userId: string;
  readonly organizationId: string;
  readonly role: MemberRole;
  readonly joinedAt: Date;

  private constructor(
    id: string,
    userId: string,
    organizationId: string,
    role: MemberRole,
    joinedAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.organizationId = organizationId;
    this.role = role;
    this.joinedAt = joinedAt;
  }

  static create(params: {
    id: string;
    userId: string;
    organizationId: string;
    role: string;
    joinedAt?: Date;
  }): Result<Membership, Error> {
    const roleResult = MemberRole.create(params.role);
    if (roleResult.isFail()) {
      return Result.fail(roleResult.unwrapError());
    }

    return Result.ok(
      new Membership(
        params.id,
        params.userId,
        params.organizationId,
        roleResult.unwrap(),
        params.joinedAt ?? new Date(),
      ),
    );
  }

  changeRole(newRole: string): Result<Membership, Error> {
    const roleResult = MemberRole.create(newRole);
    if (roleResult.isFail()) {
      return Result.fail(roleResult.unwrapError());
    }

    return Result.ok(
      new Membership(
        this.id,
        this.userId,
        this.organizationId,
        roleResult.unwrap(),
        this.joinedAt,
      ),
    );
  }
}
