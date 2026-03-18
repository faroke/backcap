// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";

const VALID_ROLES = ["owner", "admin", "member", "viewer"] as const;

export type MemberRoleType = (typeof VALID_ROLES)[number];

export class MemberRole {
  readonly value: MemberRoleType;

  private constructor(value: MemberRoleType) {
    this.value = value;
  }

  static create(value: string): Result<MemberRole, Error> {
    if (!VALID_ROLES.includes(value as MemberRoleType)) {
      return Result.fail(
        new Error(
          `Invalid member role: "${value}". Valid roles: ${VALID_ROLES.join(", ")}`,
        ),
      );
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
