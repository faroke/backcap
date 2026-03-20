import type { ITokenService } from "@domains/auth/application/ports/token-service.port.js";
import type { IAuthorizationService } from "@domains/rbac/contracts/rbac.contract.js";

interface Request {
  headers: Record<string, string | undefined>;
  user?: { userId: string; organizationId?: string };
}

interface Response {
  status(code: number): Response;
  json(data: unknown): void;
}

type NextFunction = (err?: unknown) => void;
type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;

export interface RequireAuthOptions {
  permission?: string;
}

export function requireAuth(
  tokenService: ITokenService,
  authorizationService: IAuthorizationService,
  options?: RequireAuthOptions,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid Authorization header. Expected: Bearer <token>" });
      return;
    }

    const token = authHeader.slice(7);
    const payload = await tokenService.verify(token);

    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    req.user = { userId: payload.userId, organizationId: payload.organizationId };

    if (options?.permission) {
      const parts = options.permission.split(":");
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        res.status(400).json({ error: `Invalid permission format "${options.permission}". Expected "resource:action"` });
        return;
      }
      const [resource, action] = parts;

      const result = await authorizationService.checkPermission({
        userId: payload.userId,
        action,
        resource,
        organizationId: payload.organizationId,
      });

      if (result.isFail()) {
        res.status(403).json({ error: result.unwrapError().message });
        return;
      }
    }

    next();
  };
}
