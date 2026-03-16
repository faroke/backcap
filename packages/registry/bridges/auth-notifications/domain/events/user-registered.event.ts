export class UserRegistered {
  public readonly userId: string;
  public readonly email: string;
  public readonly occurredAt: Date;

  constructor(props: { userId: string; email: string; occurredAt?: Date }) {
    this.userId = props.userId;
    this.email = props.email;
    this.occurredAt = props.occurredAt ?? new Date();
  }
}
