import type { ICommentsService } from "../../../capabilities/comments/contracts/index.js";
import { CommentNotFound } from "../../../capabilities/comments/domain/errors/comment-not-found.error.js";
import { UnauthorizedDelete } from "../../../capabilities/comments/domain/errors/unauthorized-delete.error.js";

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
  delete(path: string, handler: RequestHandler): void;
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof CommentNotFound) return { status: 404, message: error.message };
  if (error instanceof UnauthorizedDelete) return { status: 403, message: error.message };
  return { status: 500, message: "Internal server error" };
}

function parseIntSafe(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? undefined : parsed;
}

export function createCommentsRouter(commentsService: ICommentsService, router: Router): Router {
  router.post("/comments", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { content, authorId, resourceId, resourceType, parentId } = req.body as {
        content: string;
        authorId: string;
        resourceId: string;
        resourceType: string;
        parentId?: string;
      };
      const result = await commentsService.postComment({
        content, authorId, resourceId, resourceType, parentId,
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

  router.get("/comments", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await commentsService.listComments({
        resourceId: req.query.resourceId,
        resourceType: req.query.resourceType,
        includeDeleted: req.query.includeDeleted === "true",
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

  router.delete("/comments/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await commentsService.deleteComment({
        commentId: req.params.id,
        requesterId: req.body.requesterId as string,
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
