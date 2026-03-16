import type { Result } from "../shared/result.js";
import type { UserRegistered } from "../domain/events/user-registered.event.js";
import type { SendWelcomeEmailError } from "../errors/send-welcome-email.error.js";

export interface AuthNotificationsBridgeContract {
  sendWelcomeEmail(event: UserRegistered): Promise<Result<void, SendWelcomeEmailError>>;
}
