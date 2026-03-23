export class MemberAlreadyExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MemberAlreadyExists";
  }

  static create(userId: string, orgId: string): MemberAlreadyExists {
    return new MemberAlreadyExists(
      `User "${userId}" is already a member of organization "${orgId}"`,
    );
  }
}
