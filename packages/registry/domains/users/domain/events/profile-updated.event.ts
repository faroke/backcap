export class ProfileUpdated {
  public readonly profileId: string;
  public readonly userId: string;
  public readonly updatedFields: string[];
  public readonly occurredAt: Date;

  constructor(
    profileId: string,
    userId: string,
    updatedFields: string[],
    occurredAt: Date = new Date(),
  ) {
    this.profileId = profileId;
    this.userId = userId;
    this.updatedFields = updatedFields;
    this.occurredAt = occurredAt;
  }
}
