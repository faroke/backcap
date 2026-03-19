// Template: import type { IAnalyticsService } from "{{cap_rel}}/analytics/contracts/index.js";
import type { IAnalyticsService } from "../../../capabilities/analytics/contracts/index.js";
// Template: import { InvalidTrackingId } from "{{cap_rel}}/analytics/domain/errors/invalid-tracking-id.error.js";
import { InvalidTrackingId } from "../../../capabilities/analytics/domain/errors/invalid-tracking-id.error.js";

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
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof InvalidTrackingId) return { status: 400, message: error.message };
  return { status: 500, message: "Internal server error" };
}

function parseIntSafe(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? undefined : parsed;
}

export function createAnalyticsRouter(analyticsService: IAnalyticsService, router: Router): Router {
  router.post("/analytics/events", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trackingId, name, properties, userId, sessionId } = req.body as {
        trackingId: string;
        name: string;
        properties?: Record<string, unknown>;
        userId?: string;
        sessionId?: string;
      };
      const result = await analyticsService.trackEvent({ trackingId, name, properties, userId, sessionId });

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

  router.get("/analytics/events", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await analyticsService.queryEvents({
        trackingId: req.query.trackingId,
        name: req.query.name,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate) : undefined,
        limit: parseIntSafe(req.query.limit),
        offset: parseIntSafe(req.query.offset),
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

  router.get("/analytics/metrics", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await analyticsService.getMetrics({
        trackingId: req.query.trackingId,
        fromDate: new Date(req.query.fromDate),
        toDate: new Date(req.query.toDate),
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
