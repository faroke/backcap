export class OrganizationSettingsTooLarge extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganizationSettingsTooLarge";
  }

  static create(): OrganizationSettingsTooLarge {
    return new OrganizationSettingsTooLarge(
      "Organization settings exceed maximum size (64KB)",
    );
  }
}
