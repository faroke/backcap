export class EntryRecorded {
  public readonly entryId: string;
  public readonly actor: string;
  public readonly action: string;
  public readonly resource: string;
  public readonly occurredAt: Date;

  constructor(
    entryId: string,
    actor: string,
    action: string,
    resource: string,
    occurredAt: Date = new Date(),
  ) {
    this.entryId = entryId;
    this.actor = actor;
    this.action = action;
    this.resource = resource;
    this.occurredAt = occurredAt;
  }
}
