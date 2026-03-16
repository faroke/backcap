export class EventTracked {
  public readonly eventId: string;
  public readonly trackingId: string;
  public readonly name: string;
  public readonly occurredAt: Date;

  constructor(
    eventId: string,
    trackingId: string,
    name: string,
    occurredAt: Date = new Date(),
  ) {
    this.eventId = eventId;
    this.trackingId = trackingId;
    this.name = name;
    this.occurredAt = occurredAt;
  }
}
