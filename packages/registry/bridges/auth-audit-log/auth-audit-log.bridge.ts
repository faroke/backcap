import type { IEventBus } from "../../../shared/src/event-bus.port.js";
import type { Bridge } from "../../../shared/src/bridge.js";

export interface RecordAuditEntryInput {
  actor: string;
  action: string;
  resource: string;
}

export interface IRecordAuditEntry {
  execute(input: RecordAuditEntryInput): Promise<void>;
}

export interface AuthAuditLogBridgeDeps {
  recordEntry: IRecordAuditEntry;
}

interface UserRegisteredEvent {
  userId: string;
  email: string;
}

interface LoginSucceededEvent {
  userId: string;
}

export function createBridge(deps: AuthAuditLogBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<UserRegisteredEvent>("UserRegistered", async (event) => {
        try {
          await deps.recordEntry.execute({
            actor: event.userId,
            action: "USER.REGISTERED",
            resource: event.email,
          });
        } catch (error) {
          console.error("[auth-audit-log] Failed to record UserRegistered audit entry:", error);
        }
      });

      eventBus.subscribe<LoginSucceededEvent>("LoginSucceeded", async (event) => {
        try {
          await deps.recordEntry.execute({
            actor: event.userId,
            action: "USER.LOGIN",
            resource: event.userId,
          });
        } catch (error) {
          console.error("[auth-audit-log] Failed to record LoginSucceeded audit entry:", error);
        }
      });
    },
  };
}
