import { Result } from "../shared/result.js";
import type { UserRegistered } from "../domain/events/user-registered.event.js";
import type { WelcomeEmailDto } from "../dto/welcome-email.dto.js";
import { SendWelcomeEmailError } from "../errors/send-welcome-email.error.js";

export interface IEmailSender {
  sendEmail(dto: WelcomeEmailDto): Promise<void>;
}

export class SendWelcomeEmailUseCase {
  constructor(private readonly emailSender: IEmailSender) {}

  async execute(event: UserRegistered): Promise<Result<void, SendWelcomeEmailError>> {
    try {
      const dto: WelcomeEmailDto = {
        recipientEmail: event.email,
        userId: event.userId,
        occurredAt: event.occurredAt,
      };

      await this.emailSender.sendEmail(dto);
      return Result.ok(undefined);
    } catch (err) {
      return Result.fail(new SendWelcomeEmailError(err));
    }
  }
}
