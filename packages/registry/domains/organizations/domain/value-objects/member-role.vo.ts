import { Result } from "../../shared/result.js";
import { InvalidMemberRole } from "../errors/invalid-member-role.error.js";

const VALID_ROLES = ["owner", "admin", "member", "viewer"] as const;

export type MemberRoleType = (typeof VALID_ROLES)[number];

export class MemberRole {
  readonly value: MemberRoleType;

  private constructor(value: MemberRoleType) {
    this.value = value;
  }

  static create(value: string): Result<MemberRole, InvalidMemberRole> {
    if (!VALID_ROLES.includes(value as MemberRoleType)) {
      return Result.fail(InvalidMemberRole.create(value, VALID_ROLES));
    }
    return Result.ok(new MemberRole(value as MemberRoleType));
  }

  equals(other: MemberRole): boolean {
    return this.value === other.value;
  }

  isOwner(): boolean {
    return this.value === "owner";
  }

  isAtLeast(role: MemberRoleType): boolean {
    const hierarchy = VALID_ROLES;
    return hierarchy.indexOf(this.value) <= hierarchy.indexOf(role);
  }
}
