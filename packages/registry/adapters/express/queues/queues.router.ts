// Template: import type { IQueuesService } from "{{cap_rel}}/queues/contracts/index.js";
import type { IQueuesService } from "../../../capabilities/queues/contracts/index.js";
// Template: import { JobNotFound } from "{{cap_rel}}/queues/domain/errors/job-not-found.error.js";
import { JobNotFound } from "../../../capabilities/queues/domain/errors/job-not-found.error.js";
// Template: import { MaxAttemptsExceeded } from "{{cap_rel}}/queues/domain/errors/max-attempts-exceeded.error.js";
import { MaxAttemptsExceeded } from "../../../capabilities/queues/domain/errors/max-attempts-exceeded.error.js";
// Template: import { InvalidJobPayload } from "{{cap_rel}}/queues/domain/errors/invalid-job-payload.error.js";
import { InvalidJobPayload } from "../../../capabilities/queues/domain/errors/invalid-job-payload.error.js";

interface Request {
  body: Record<string, unknown>;
  params: Record<string, string>;
}

interface Response {
  status(code: number): Response;
  json(data: unknown): void;
}

type NextFunction = (err?: unknown) => void;
type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;
interface Router {
  post(path: string, handler: RequestHandler): void;
  get(path: string, handler: RequestHandler): void;
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof JobNotFound) return { status: 404, message: error.message };
  if (error instanceof MaxAttemptsExceeded) return { status: 429, message: error.message };
  if (error instanceof InvalidJobPayload) return { status: 400, message: error.message };
  return { status: 500, message: "Internal server error" };
}

export function createQueuesRouter(
  queuesService: IQueuesService,
  router: Router,
): Router {
  router.post("/jobs", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, payload, scheduledAt } = req.body as {
        type: string;
        payload: Record<string, unknown>;
        scheduledAt?: string;
      };
      const result = await queuesService.enqueue({
        type,
        payload,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      });

      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }

      res.status(201).json(result.unwrap());
    } catch (err) {
      next(err);
    }
  });

  router.post("/jobs/:id/process", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await queuesService.process({
        jobId: req.params.id,
      });

      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }

      res.status(200).json(result.unwrap());
    } catch (err) {
      next(err);
    }
  });

  router.get("/jobs/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await queuesService.getStatus({
        jobId: req.params.id,
      });

      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }

      res.status(200).json(result.unwrap());
    } catch (err) {
      next(err);
    }
  });

  return router;
}
