// Template: import type { IMediaService } from "{{cap_rel}}/media/contracts/index.js";
import type { IMediaService } from "../../../capabilities/media/contracts/index.js";
// Template: import { MediaNotFound } from "{{cap_rel}}/media/domain/errors/media-not-found.error.js";
import { MediaNotFound } from "../../../capabilities/media/domain/errors/media-not-found.error.js";
// Template: import { UnsupportedFormat } from "{{cap_rel}}/media/domain/errors/unsupported-format.error.js";
import { UnsupportedFormat } from "../../../capabilities/media/domain/errors/unsupported-format.error.js";
// Template: import { FileTooLarge } from "{{cap_rel}}/media/domain/errors/file-too-large.error.js";
import { FileTooLarge } from "../../../capabilities/media/domain/errors/file-too-large.error.js";
// Template: import { ProcessingFailed } from "{{cap_rel}}/media/domain/errors/processing-failed.error.js";
import { ProcessingFailed } from "../../../capabilities/media/domain/errors/processing-failed.error.js";

interface Request {
  body: Record<string, unknown>;
  params: Record<string, string>;
  query: Record<string, string | undefined>;
  file?: { originalname: string; mimetype: string; size: number; path: string };
}

interface Response {
  status(code: number): Response;
  json(data: unknown): void;
}

type NextFunction = (err?: unknown) => void;
type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;
interface Router {
  get(path: string, ...handlers: RequestHandler[]): void;
  post(path: string, ...handlers: RequestHandler[]): void;
  delete(path: string, handler: RequestHandler): void;
}

type MulterMiddleware = RequestHandler;

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof MediaNotFound) return { status: 404, message: error.message };
  if (error instanceof FileTooLarge) return { status: 413, message: error.message };
  if (error instanceof UnsupportedFormat) return { status: 400, message: error.message };
  if (error instanceof ProcessingFailed) return { status: 422, message: error.message };
  return { status: 500, message: "Internal server error" };
}

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

function parsePositiveInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return undefined;
  return Math.floor(num);
}

interface VariantSpec {
  purpose: string;
  width: number;
  height: number;
  format: string;
}

function validateVariants(raw: unknown): { valid: VariantSpec[] } | { error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: "variants must be a non-empty array" };
  }
  const valid: VariantSpec[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== "object") {
      return { error: `variants[${i}] must be an object` };
    }
    const { purpose, width, height, format } = item as Record<string, unknown>;
    if (typeof purpose !== "string" || !purpose) {
      return { error: `variants[${i}].purpose must be a non-empty string` };
    }
    if (typeof width !== "number" || !Number.isInteger(width) || width <= 0) {
      return { error: `variants[${i}].width must be a positive integer` };
    }
    if (typeof height !== "number" || !Number.isInteger(height) || height <= 0) {
      return { error: `variants[${i}].height must be a positive integer` };
    }
    if (typeof format !== "string" || !format) {
      return { error: `variants[${i}].format must be a non-empty string` };
    }
    valid.push({ purpose, width, height, format });
  }
  return { valid };
}

export function createMediaRouter(
  mediaService: IMediaService,
  router: Router,
  uploadMiddleware?: MulterMiddleware,
): Router {
  // POST /media — upload
  const uploadHandlers: RequestHandler[] = [];
  if (uploadMiddleware) uploadHandlers.push(uploadMiddleware);

  uploadHandlers.push(asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const width = parsePositiveInt(req.body.width);
    const height = parsePositiveInt(req.body.height);

    const result = await mediaService.upload({
      name: file.originalname,
      originalUrl: file.path,
      mimeType: file.mimetype,
      size: file.size,
      width,
      height,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap().output);
  }));

  router.post("/media", ...uploadHandlers);

  // POST /media/:id/process — generate variants
  router.post("/media/:id/process", asyncHandler(async (req: Request, res: Response) => {
    const validation = validateVariants(req.body.variants);
    if ("error" in validation) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const result = await mediaService.process({
      mediaId: req.params.id,
      variants: validation.valid,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap().output);
  }));

  // GET /media/:id/url — get CDN URL (registered before :id to avoid shadowing)
  router.get("/media/:id/url", asyncHandler(async (req: Request, res: Response) => {
    const result = await mediaService.getUrl({
      mediaId: req.params.id,
      purpose: req.query.purpose,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  }));

  // GET /media — list
  router.get("/media", asyncHandler(async (req: Request, res: Response) => {
    const limit = parsePositiveInt(req.query.limit);
    const offset = parsePositiveInt(req.query.offset);

    const result = await mediaService.list({ limit, offset });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  }));

  // GET /media/:id — get single
  router.get("/media/:id", asyncHandler(async (req: Request, res: Response) => {
    const result = await mediaService.get({ mediaId: req.params.id });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  }));

  // DELETE /media/:id
  router.delete("/media/:id", asyncHandler(async (req: Request, res: Response) => {
    const result = await mediaService.delete({ mediaId: req.params.id });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  }));

  return router;
}
