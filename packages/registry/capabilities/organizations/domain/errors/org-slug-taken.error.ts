export class OrgSlugTaken extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrgSlugTaken";
  }

  static create(slug: string): OrgSlugTaken {
    return new OrgSlugTaken(`Organization slug already taken: "${slug}"`);
  }
}
