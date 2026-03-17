import type { IAuditLogService } from "../../../capabilities/audit-log/contracts/index.js";
import { InvalidAuditAction } from "../../../capabilities/audit-log/domain/errors/invalid-audit-action.error.js";

interface Request {
  body: Record<string, unknown>;
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
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof InvalidAuditAction)
    return { status: 400, message: error.message };
  return { status: 500, message: "Internal server error" };
}

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function parsePositiveInt(value: string): number | null {
  const num = parseInt(value, 10);
  return isNaN(num) || num < 0 ? null : num;
}

export function createAuditLogRouter(
  service: IAuditLogService,
  router: Router,
): Router {
  router.post("/audit", async (req: Request, res: Response) => {
    const { actor, action, resource, metadata } = req.body as {
      actor: string;
      action: string;
      resource: string;
      metadata?: Record<string, unknown>;
    };

    const result = await service.record({ actor, action, resource, metadata });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  });

  router.get("/audit", async (req: Request, res: Response) => {
    const input: Record<string, unknown> = {};

    if (req.query["actor"]) input["actor"] = req.query["actor"];
    if (req.query["action"]) input["action"] = req.query["action"];
    if (req.query["resource"]) input["resource"] = req.query["resource"];

    if (req.query["fromDate"]) {
      const date = parseDate(req.query["fromDate"]);
      if (!date) {
        res.status(400).json({ error: "Invalid fromDate parameter" });
        return;
      }
      input["fromDate"] = date;
    }

    if (req.query["toDate"]) {
      const date = parseDate(req.query["toDate"]);
      if (!date) {
        res.status(400).json({ error: "Invalid toDate parameter" });
        return;
      }
      input["toDate"] = date;
    }

    if (req.query["limit"]) {
      const limit = parsePositiveInt(req.query["limit"]);
      if (limit === null) {
        res.status(400).json({ error: "Invalid limit parameter" });
        return;
      }
      input["limit"] = limit;
    }

    if (req.query["offset"]) {
      const offset = parsePositiveInt(req.query["offset"]);
      if (offset === null) {
        res.status(400).json({ error: "Invalid offset parameter" });
        return;
      }
      input["offset"] = offset;
    }

    const result = await service.query(input);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  return router;
}
