// Template: import type { IBlogService } from "{{capabilities_path}}/blog/contracts";
import type { IBlogService } from "../../../capabilities/blog/contracts/index.js";
import { InvalidSlug } from "../../../capabilities/blog/domain/errors/invalid-slug.error.js";
import { PostNotFound } from "../../../capabilities/blog/domain/errors/post-not-found.error.js";
import { PostAlreadyPublished } from "../../../capabilities/blog/domain/errors/post-already-published.error.js";

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
  get(path: string, handler: RequestHandler): void;
  post(path: string, handler: RequestHandler): void;
  put(path: string, handler: RequestHandler): void;
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof InvalidSlug) return { status: 400, message: error.message };
  if (error instanceof PostNotFound) return { status: 404, message: error.message };
  if (error instanceof PostAlreadyPublished) return { status: 409, message: error.message };
  return { status: 500, message: "Internal server error" };
}

export function createBlogRouter(blogService: IBlogService, router: Router): Router {
  router.post("/posts", async (req: Request, res: Response) => {
    const { title, slug, content, authorId } = req.body as {
      title: string;
      slug?: string;
      content: string;
      authorId: string;
    };
    const result = await blogService.createPost({ title, slug, content, authorId });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  });

  router.put("/posts/:id/publish", async (req: Request, res: Response) => {
    const result = await blogService.publishPost({ postId: req.params.id });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  router.get("/posts/:id", async (req: Request, res: Response) => {
    const result = await blogService.getPost({ postId: req.params.id });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  router.get("/posts", async (req: Request, res: Response) => {
    const result = await blogService.listPosts({});

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  return router;
}
