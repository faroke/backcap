import type { IFeatureFlagsService } from "../../../capabilities/feature-flags/contracts/index.js";
import { FlagNotFound } from "../../../capabilities/feature-flags/domain/errors/flag-not-found.error.js";
import { FlagAlreadyInState } from "../../../capabilities/feature-flags/domain/errors/flag-already-in-state.error.js";
import { FlagAlreadyExists } from "../../../capabilities/feature-flags/domain/errors/flag-already-exists.error.js";
import { InvalidFlagKey } from "../../../capabilities/feature-flags/domain/errors/invalid-flag-key.error.js";

interface Request {
  body: Record<string, unknown>;
  params: Record<string, string>;
  query: Record<string, string>;
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
  put(path: string, handler: RequestHandler): void;
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof FlagNotFound) return { status: 404, message: error.message };
  if (error instanceof FlagAlreadyInState) return { status: 409, message: error.message };
  if (error instanceof FlagAlreadyExists) return { status: 409, message: error.message };
  if (error instanceof InvalidFlagKey) return { status: 400, message: error.message };
  return { status: 500, message: "Internal server error" };
}

export function createFeatureFlagsRouter(
  service: IFeatureFlagsService,
  router: Router,
): Router {
  router.get("/flags/:key/evaluate", async (req: Request, res: Response) => {
    let context: Record<string, unknown> | undefined;
    if (req.query["context"]) {
      try {
        context = JSON.parse(req.query["context"]) as Record<string, unknown>;
      } catch {
        res.status(400).json({ error: "Invalid JSON in context query parameter" });
        return;
      }
    }

    const result = await service.evaluate({
      key: req.params["key"]!,
      context,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  router.post("/flags", async (req: Request, res: Response) => {
    const { key, isEnabled, conditions } = req.body as {
      key: string;
      isEnabled?: boolean;
      conditions?: Record<string, unknown>;
    };

    const result = await service.create({ key, isEnabled, conditions });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  });

  router.put("/flags/:key/toggle", async (req: Request, res: Response) => {
    const { enabled } = req.body as { enabled: boolean };

    const result = await service.toggle({
      key: req.params["key"]!,
      enabled,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  return router;
}
