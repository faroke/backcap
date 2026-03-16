export class UserRegistered {
  public readonly userId: string;
  public readonly email: string;
  public readonly occurredAt: Date;

  constructor(userId: string, email: string, occurredAt: Date = new Date()) {
    this.userId = userId;
    this.email = email;
    this.occurredAt = occurredAt;
  }
}
