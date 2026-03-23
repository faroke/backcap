export class OrgNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrgNotFound";
  }

  static create(orgId: string): OrgNotFound {
    return new OrgNotFound(`Organization not found with id: "${orgId}"`);
  }
}
