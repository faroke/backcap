import type { IEventBus } from "../../../shared/src/event-bus.port.js";
import type { Bridge } from "../../../shared/src/bridge.js";

interface UserRegisteredEvent {
  userId: string;
  email: string;
  occurredAt: Date;
}

interface SendWelcomeEmailResult {
  isFail(): boolean;
  error?: Error;
}

export interface ISendWelcomeEmail {
  execute(event: UserRegisteredEvent): Promise<SendWelcomeEmailResult>;
}

export interface AuthNotificationsBridgeDeps {
  sendWelcomeEmail: ISendWelcomeEmail;
}

export function createBridge(deps: AuthNotificationsBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<UserRegisteredEvent>("UserRegistered", async (event) => {
        try {
          const result = await deps.sendWelcomeEmail.execute(event);
          if (result.isFail()) {
            console.error("[auth-notifications] SendWelcomeEmail failed:", result.error);
          }
        } catch (error) {
          console.error("[auth-notifications] Failed to send welcome email:", error);
        }
      });
    },
  };
}
