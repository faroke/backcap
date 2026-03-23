export class DuplicateRole extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateRole";
  }

  static create(roleName: string): DuplicateRole {
    return new DuplicateRole(`Role already exists with name: "${roleName}"`);
  }
}
