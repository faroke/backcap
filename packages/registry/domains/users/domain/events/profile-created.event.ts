export class ProfileCreated {
  public readonly profileId: string;
  public readonly userId: string;
  public readonly displayName: string;
  public readonly occurredAt: Date;

  constructor(
    profileId: string,
    userId: string,
    displayName: string,
    occurredAt: Date = new Date(),
  ) {
    this.profileId = profileId;
    this.userId = userId;
    this.displayName = displayName;
    this.occurredAt = occurredAt;
  }
}
