// Template: import type { INotificationsService } from "{{capabilities_path}}/notifications/contracts";
import type { INotificationsService } from "../../../capabilities/notifications/contracts/index.js";
import { NotificationNotFound } from "../../../capabilities/notifications/domain/errors/notification-not-found.error.js";
import { InvalidChannel } from "../../../capabilities/notifications/domain/errors/invalid-channel.error.js";

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
  get(path: string, handler: RequestHandler): void;
  post(path: string, handler: RequestHandler): void;
  put(path: string, handler: RequestHandler): void;
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof NotificationNotFound) return { status: 404, message: error.message };
  if (error instanceof InvalidChannel) return { status: 400, message: error.message };
  return { status: 500, message: "Internal server error" };
}

export function createNotificationsRouter(
  notificationsService: INotificationsService,
  router: Router,
): Router {
  router.post("/notifications", async (req: Request, res: Response) => {
    const { channel, recipient, subject, body } = req.body as {
      channel: string;
      recipient: string;
      subject: string;
      body: string;
    };
    const result = await notificationsService.send({ channel, recipient, subject, body });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  });

  router.get("/notifications", async (req: Request, res: Response) => {
    const { recipient } = req.query;
    if (!recipient) {
      res.status(400).json({ error: "Missing required query parameter: recipient" });
      return;
    }
    const result = await notificationsService.getByRecipient({
      recipient,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  router.put("/notifications/:id/read", async (req: Request, res: Response) => {
    const result = await notificationsService.markAsRead({
      notificationId: req.params.id,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  });

  return router;
}
