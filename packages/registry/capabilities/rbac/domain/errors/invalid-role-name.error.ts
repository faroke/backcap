export class InvalidRoleName extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRoleName";
  }

  static create(name: string): InvalidRoleName {
    return new InvalidRoleName(`Invalid role name: "${name}". Role name cannot be empty`);
  }
}
