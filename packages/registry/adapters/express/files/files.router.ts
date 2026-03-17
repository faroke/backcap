// Template: import type { IFilesService } from "{{capabilities_path}}/files/contracts";
import type { IFilesService } from "../../../capabilities/files/contracts/index.js";
import { FileNotFound } from "../../../capabilities/files/domain/errors/file-not-found.error.js";
import { InvalidFilePath } from "../../../capabilities/files/domain/errors/invalid-file-path.error.js";
import { FileTooLarge } from "../../../capabilities/files/domain/errors/file-too-large.error.js";

interface Request {
  body: Record<string, unknown>;
  params: Record<string, string>;
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
  if (error instanceof FileNotFound) return { status: 404, message: error.message };
  if (error instanceof FileTooLarge) return { status: 413, message: error.message };
  if (error instanceof InvalidFilePath) return { status: 400, message: error.message };
  return { status: 500, message: "Internal server error" };
}

export function createFilesRouter(
  filesService: IFilesService,
  router: Router,
  uploadMiddleware?: MulterMiddleware,
): Router {
  const handlers: RequestHandler[] = [];
  if (uploadMiddleware) handlers.push(uploadMiddleware);

  handlers.push(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const result = await filesService.upload({
      name: file.originalname,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  });

  router.post("/files", ...handlers);

  router.get("/files/:id", async (req: Request, res: Response) => {
    const result = await filesService.get({ fileId: req.params.id });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  router.delete("/files/:id", async (req: Request, res: Response) => {
    const result = await filesService.delete({ fileId: req.params.id });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  });

  return router;
}
