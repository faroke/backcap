// Template: import type { ITagsService } from "{{cap_rel}}/tags/contracts/index.js";
import type { ITagsService } from "../../../capabilities/tags/contracts/index.js";
// Template: import { TagNotFound } from "{{cap_rel}}/tags/domain/errors/tag-not-found.error.js";
import { TagNotFound } from "../../../capabilities/tags/domain/errors/tag-not-found.error.js";
// Template: import { ResourceTagNotFound } from "{{cap_rel}}/tags/domain/errors/resource-tag-not-found.error.js";
import { ResourceTagNotFound } from "../../../capabilities/tags/domain/errors/resource-tag-not-found.error.js";
// Template: import { InvalidTagSlug } from "{{cap_rel}}/tags/domain/errors/invalid-tag-slug.error.js";
import { InvalidTagSlug } from "../../../capabilities/tags/domain/errors/invalid-tag-slug.error.js";
// Template: import { TagAlreadyExists } from "{{cap_rel}}/tags/domain/errors/tag-already-exists.error.js";
import { TagAlreadyExists } from "../../../capabilities/tags/domain/errors/tag-already-exists.error.js";
// Template: import { ResourceAlreadyTagged } from "{{cap_rel}}/tags/domain/errors/resource-already-tagged.error.js";
import { ResourceAlreadyTagged } from "../../../capabilities/tags/domain/errors/resource-already-tagged.error.js";

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
  if (error instanceof InvalidTagSlug) return { status: 400, message: error.message };
  if (error instanceof TagAlreadyExists) return { status: 409, message: error.message };
  if (error instanceof ResourceAlreadyTagged) return { status: 409, message: error.message };
  if (error instanceof TagNotFound) return { status: 404, message: error.message };
  if (error instanceof ResourceTagNotFound) return { status: 404, message: error.message };
  return { status: 500, message: "Internal server error" };
}

function parseIntSafe(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? undefined : parsed;
}

export function createTagsRouter(tagsService: ITagsService, router: Router): Router {
  router.post("/tags", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body as { name: string };
      const result = await tagsService.createTag({ name });

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

  router.post("/tags/:slug/resources", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceId, resourceType } = req.body as {
        resourceId: string;
        resourceType: string;
      };
      const result = await tagsService.tagResource({
        tagSlug: req.params.slug,
        resourceId,
        resourceType,
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

  router.delete("/tags/:slug/resources/:resourceId", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceType } = req.body as { resourceType: string };
      const result = await tagsService.untagResource({
        tagSlug: req.params.slug,
        resourceId: req.params.resourceId,
        resourceType,
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

  router.get("/tags/:slug/resources", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await tagsService.listByTag({
        tagSlug: req.params.slug,
        resourceType: req.query.resourceType,
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

  return router;
}
