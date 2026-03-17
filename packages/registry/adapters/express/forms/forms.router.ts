import type { IFormsService } from "../../../capabilities/forms/contracts/index.js";
import { FormNotFound } from "../../../capabilities/forms/domain/errors/form-not-found.error.js";
import { FormValidationFailed } from "../../../capabilities/forms/domain/errors/form-validation-failed.error.js";

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
  if (error instanceof FormNotFound) return { status: 404, message: error.message };
  if (error instanceof FormValidationFailed) return { status: 400, message: error.message };
  return { status: 500, message: "Internal server error" };
}

function parseIntSafe(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? undefined : parsed;
}

export function createFormsRouter(formsService: IFormsService, router: Router): Router {
  router.post("/forms", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await formsService.createForm(req.body as { name: string; fields: Array<{ name: string; type: "text" | "email" | "number" | "boolean" | "select"; required: boolean; options?: string[] }> });

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

  router.post("/forms/:id/submit", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await formsService.submitForm({
        formId: req.params.id,
        data: req.body as Record<string, unknown>,
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

  router.get("/forms/:id/submissions", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await formsService.getSubmissions({
        formId: req.params.id,
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
