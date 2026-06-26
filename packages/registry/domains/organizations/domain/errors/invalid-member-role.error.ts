export class InvalidMemberRole extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMemberRole";
  }

  static create(role: string, validRoles: readonly string[]): InvalidMemberRole {
    return new InvalidMemberRole(
      `Invalid member role: "${role}". Valid roles: ${validRoles.join(", ")}`,
    );
  }
}
