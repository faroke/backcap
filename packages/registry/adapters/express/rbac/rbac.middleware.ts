// Template: import type { IAuthorizationService } from "{{cap_rel}}/rbac/contracts/index.js";
import type { IAuthorizationService } from "../../../capabilities/rbac/contracts/index.js";

interface Request {
  user?: { userId: string };
}

interface Response {
  status(code: number): Response;
  json(data: unknown): void;
}

type NextFunction = (err?: unknown) => void;
type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;

export function requirePermission(
  authorizationService: IAuthorizationService,
  resource: string,
  action: string,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const result = await authorizationService.checkPermission({
      userId: req.user.userId,
      action,
      resource,
    });

    if (result.isFail()) {
      res.status(403).json({ error: result.unwrapError().message });
      return;
    }

    next();
  };
}
