export class CannotRemoveOwner extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CannotRemoveOwner";
  }

  static create(orgId: string): CannotRemoveOwner {
    return new CannotRemoveOwner(
      `Cannot remove the owner of organization "${orgId}". Transfer ownership first.`,
    );
  }
}
