// Template: import type { IAuthorizationService } from "{{cap_rel}}/rbac/contracts/index.js";
import type { IAuthorizationService } from "../../../capabilities/rbac/contracts/index.js";
// Template: import { RoleNotFound } from "{{cap_rel}}/rbac/domain/errors/role-not-found.error.js";
import { RoleNotFound } from "../../../capabilities/rbac/domain/errors/role-not-found.error.js";
// Template: import { DuplicateRole } from "{{cap_rel}}/rbac/domain/errors/duplicate-role.error.js";
import { DuplicateRole } from "../../../capabilities/rbac/domain/errors/duplicate-role.error.js";
// Template: import { PermissionDenied } from "{{cap_rel}}/rbac/domain/errors/permission-denied.error.js";
import { PermissionDenied } from "../../../capabilities/rbac/domain/errors/permission-denied.error.js";

interface Request {
  body: Record<string, unknown>;
  params: Record<string, string>;
  user?: { userId: string };
}

interface Response {
  status(code: number): Response;
  json(data: unknown): void;
}

type NextFunction = (err?: unknown) => void;
type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;
interface Router {
  get(path: string, handler: RequestHandler): void;
  post(path: string, handler: RequestHandler): void;
  delete(path: string, handler: RequestHandler): void;
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof DuplicateRole) return { status: 409, message: error.message };
  if (error instanceof RoleNotFound) return { status: 404, message: error.message };
  if (error instanceof PermissionDenied) return { status: 403, message: error.message };
  return { status: 500, message: "Internal server error" };
}

export function createRbacRouter(
  authorizationService: IAuthorizationService,
  router: Router,
): Router {
  router.post("/roles", async (req: Request, res: Response) => {
    const { name, description, permissions } = req.body as {
      name: string;
      description: string;
      permissions?: { action: string; resource: string; conditions?: Record<string, unknown> }[];
    };
    const result = await authorizationService.createRole({ name, description, permissions });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  });

  router.get("/roles", async (_req: Request, res: Response) => {
    const result = await authorizationService.listRoles();

    if (result.isFail()) {
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  router.post("/roles/assign", async (req: Request, res: Response) => {
    const { userId, roleId } = req.body as { userId: string; roleId: string };
    const result = await authorizationService.assignRole({ userId, roleId });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  });

  router.post("/roles/revoke", async (req: Request, res: Response) => {
    const { userId, roleId } = req.body as { userId: string; roleId: string };
    const result = await authorizationService.revokeRole({ userId, roleId });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  });

  return router;
}
