export class RoleNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoleNotFound";
  }

  static create(roleId: string): RoleNotFound {
    return new RoleNotFound(`Role not found with id: "${roleId}"`);
  }
}
