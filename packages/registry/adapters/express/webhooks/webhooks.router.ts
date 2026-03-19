// Template: import type { IWebhooksService } from "{{cap_rel}}/webhooks/contracts/index.js";
import type { IWebhooksService } from "../../../capabilities/webhooks/contracts/index.js";
// Template: import { WebhookNotFound } from "{{cap_rel}}/webhooks/domain/errors/webhook-not-found.error.js";
import { WebhookNotFound } from "../../../capabilities/webhooks/domain/errors/webhook-not-found.error.js";
// Template: import { WebhookDeliveryFailed } from "{{cap_rel}}/webhooks/domain/errors/webhook-delivery-failed.error.js";
import { WebhookDeliveryFailed } from "../../../capabilities/webhooks/domain/errors/webhook-delivery-failed.error.js";
// Template: import { InvalidWebhookUrl } from "{{cap_rel}}/webhooks/domain/errors/invalid-webhook-url.error.js";
import { InvalidWebhookUrl } from "../../../capabilities/webhooks/domain/errors/invalid-webhook-url.error.js";

interface Request {
  body: Record<string, unknown>;
  params: Record<string, string>;
  query: Record<string, string | undefined>;
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
  if (error instanceof WebhookNotFound) return { status: 404, message: error.message };
  if (error instanceof WebhookDeliveryFailed) return { status: 502, message: error.message };
  if (error instanceof InvalidWebhookUrl) return { status: 400, message: error.message };
  return { status: 500, message: "Internal server error" };
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0) return undefined;
  return parsed;
}

export function createWebhooksRouter(
  webhooksService: IWebhooksService,
  router: Router,
): Router {
  router.post("/webhooks", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url, events, secret } = req.body as {
        url: string;
        events: string[];
        secret: string;
      };
      const result = await webhooksService.register({ url, events, secret });

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

  router.post(
    "/webhooks/:id/trigger",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { eventType, payload } = req.body as {
          eventType: string;
          payload: unknown;
        };
        const result = await webhooksService.trigger({
          webhookId: req.params.id,
          eventType,
          payload,
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
    },
  );

  router.get("/webhooks", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isActive =
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined;
      const limit = parsePositiveInt(req.query.limit);
      const offset = parsePositiveInt(req.query.offset);

      const result = await webhooksService.list({ isActive, limit, offset });

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
