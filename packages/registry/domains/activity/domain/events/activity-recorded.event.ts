export class ActivityRecorded {
  public readonly entryId: string;
  public readonly actorId: string;
  public readonly actorDisplayName: string;
  public readonly action: string;
  public readonly targetId: string;
  public readonly targetName: string;
  public readonly occurredAt: Date;

  constructor(
    entryId: string,
    actorId: string,
    actorDisplayName: string,
    action: string,
    targetId: string,
    targetName: string,
    occurredAt: Date = new Date(),
  ) {
    this.entryId = entryId;
    this.actorId = actorId;
    this.actorDisplayName = actorDisplayName;
    this.action = action;
    this.targetId = targetId;
    this.targetName = targetName;
    this.occurredAt = occurredAt;
  }
}
