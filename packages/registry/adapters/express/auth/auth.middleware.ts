// Template: import type { ITokenService } from "{{capabilities_path}}/auth/application/ports/token-service.port";
import type { ITokenService } from "../../../capabilities/auth/application/ports/token-service.port.js";

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

export function createAuthMiddleware(tokenService: ITokenService): RequestHandler {
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
    next();
  };
}
