export class InvalidChannel extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidChannel";
  }

  static create(channel: string): InvalidChannel {
    return new InvalidChannel(
      `Invalid notification channel: "${channel}". Must be one of: email, sms, push`,
    );
  }
}
