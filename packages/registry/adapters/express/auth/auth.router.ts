// Template: import type { IAuthService } from "{{capabilities_path}}/auth/contracts";
import type { IAuthService } from "../../../capabilities/auth/contracts/index.js";
import { UserAlreadyExists } from "../../../capabilities/auth/domain/errors/user-already-exists.error.js";
import { UserNotFound } from "../../../capabilities/auth/domain/errors/user-not-found.error.js";
import { InvalidCredentials } from "../../../capabilities/auth/domain/errors/invalid-credentials.error.js";
import { InvalidEmail } from "../../../capabilities/auth/domain/errors/invalid-email.error.js";

interface Request {
  body: Record<string, unknown>;
}

interface Response {
  status(code: number): Response;
  json(data: unknown): void;
}

type NextFunction = (err?: unknown) => void;
type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;
interface Router {
  post(path: string, handler: RequestHandler): void;
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof UserAlreadyExists) return { status: 409, message: error.message };
  if (error instanceof UserNotFound) return { status: 401, message: "Invalid credentials" };
  if (error instanceof InvalidCredentials) return { status: 401, message: "Invalid credentials" };
  if (error instanceof InvalidEmail) return { status: 400, message: error.message };
  return { status: 500, message: "Internal server error" };
}

export function createAuthRouter(authService: IAuthService, router: Router): Router {
  router.post("/auth/register", async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.register({ email, password });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  });

  router.post("/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login({ email, password });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  return router;
}
