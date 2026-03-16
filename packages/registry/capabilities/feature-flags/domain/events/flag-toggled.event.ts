export class FlagToggled {
  public readonly flagId: string;
  public readonly key: string;
  public readonly isEnabled: boolean;
  public readonly occurredAt: Date;

  constructor(
    flagId: string,
    key: string,
    isEnabled: boolean,
    occurredAt: Date = new Date(),
  ) {
    this.flagId = flagId;
    this.key = key;
    this.isEnabled = isEnabled;
    this.occurredAt = occurredAt;
  }
}
