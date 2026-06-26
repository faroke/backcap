export class InvalidOrganizationName extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOrganizationName";
  }

  static create(): InvalidOrganizationName {
    return new InvalidOrganizationName("Organization name is required");
  }
}
