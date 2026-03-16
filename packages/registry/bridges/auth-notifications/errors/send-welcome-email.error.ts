export class SendWelcomeEmailError extends Error {
  public readonly cause: unknown;

  constructor(cause: unknown) {
    super("Failed to send welcome email");
    this.name = "SendWelcomeEmailError";
    this.cause = cause;
  }
}
