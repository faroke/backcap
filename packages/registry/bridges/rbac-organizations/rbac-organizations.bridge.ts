import type { IEventBus } from "../../../shared/src/event-bus.port.js";
import type { Bridge } from "../../../shared/src/bridge.js";

interface MemberJoinedEvent {
  organizationId: string;
  userId: string;
  role: string;
  occurredAt: Date;
}

interface AssignRoleResult {
  isFail(): boolean;
  error?: Error;
}

export interface IAssignRole {
  execute(input: {
    userId: string;
    roleId: string;
    organizationId?: string;
  }): Promise<AssignRoleResult>;
}

export interface RbacOrganizationsBridgeDeps {
  assignRole: IAssignRole;
  defaultRoleId: string;
  roleMapping?: Record<string, string>;
}

export function createBridge(deps: RbacOrganizationsBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<MemberJoinedEvent>("MemberJoined", async (event) => {
        try {
          const roleId = deps.roleMapping?.[event.role] ?? deps.defaultRoleId;
          const result = await deps.assignRole.execute({
            userId: event.userId,
            roleId,
            organizationId: event.organizationId,
          });
          if (result.isFail()) {
            console.error("[rbac-organizations] AssignRole failed:", result.error);
          }
        } catch (error) {
          console.error("[rbac-organizations] Failed to assign role within org:", error);
        }
      });
    },
  };
}
