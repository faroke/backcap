// Template: import type { ICatalogService } from "{{cap_rel}}/catalog/contracts/index.js";
import type { ICatalogService } from "../../../capabilities/catalog/contracts/index.js";
// Template: import { ProductNotFound } from "{{cap_rel}}/catalog/domain/errors/product-not-found.error.js";
import { ProductNotFound } from "../../../capabilities/catalog/domain/errors/product-not-found.error.js";
// Template: import { DuplicateSKU } from "{{cap_rel}}/catalog/domain/errors/duplicate-sku.error.js";
import { DuplicateSKU } from "../../../capabilities/catalog/domain/errors/duplicate-sku.error.js";
// Template: import { InvalidPrice } from "{{cap_rel}}/catalog/domain/errors/invalid-price.error.js";
import { InvalidPrice } from "../../../capabilities/catalog/domain/errors/invalid-price.error.js";

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
  put(path: string, handler: RequestHandler): void;
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof ProductNotFound) return { status: 404, message: error.message };
  if (error instanceof DuplicateSKU) return { status: 409, message: error.message };
  if (error instanceof InvalidPrice) return { status: 400, message: error.message };
  if (error.name === "ProductNotFound") return { status: 404, message: error.message };
  if (error.name === "DuplicateSKU") return { status: 409, message: error.message };
  if (error.name === "InvalidPrice") return { status: 400, message: error.message };
  return { status: 400, message: error.message };
}

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export function createCatalogRouter(catalogService: ICatalogService, router: Router): Router {
  // Products
  router.post("/products", asyncHandler(async (req: Request, res: Response) => {
    const { name, description, basePriceCents, currency, categoryId } = req.body as Record<string, unknown>;
    if (typeof name !== "string" || typeof description !== "string" || typeof basePriceCents !== "number") {
      res.status(400).json({ error: "name (string), description (string), and basePriceCents (number) are required" });
      return;
    }
    if (currency !== undefined && typeof currency !== "string") {
      res.status(400).json({ error: "currency must be a string" });
      return;
    }
    if (categoryId !== undefined && typeof categoryId !== "string") {
      res.status(400).json({ error: "categoryId must be a string" });
      return;
    }
    const result = await catalogService.createProduct({
      name,
      description,
      basePriceCents,
      currency: currency as string | undefined,
      categoryId: categoryId as string | undefined,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  }));

  router.get("/products", asyncHandler(async (_req: Request, res: Response) => {
    const result = await catalogService.listProducts();

    if (result.isFail()) {
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.status(200).json(result.unwrap());
  }));

  router.get("/products/:id", asyncHandler(async (req: Request, res: Response) => {
    const result = await catalogService.getProduct(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  }));

  router.post("/products/:id/publish", asyncHandler(async (req: Request, res: Response) => {
    const result = await catalogService.publishProduct(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  }));

  router.post("/products/:id/variants", asyncHandler(async (req: Request, res: Response) => {
    const { sku, priceCents, currency, attributes } = req.body as Record<string, unknown>;
    if (typeof sku !== "string" || typeof priceCents !== "number") {
      res.status(400).json({ error: "sku (string) and priceCents (number) are required" });
      return;
    }
    if (currency !== undefined && typeof currency !== "string") {
      res.status(400).json({ error: "currency must be a string" });
      return;
    }
    if (attributes !== undefined && (typeof attributes !== "object" || attributes === null || Array.isArray(attributes))) {
      res.status(400).json({ error: "attributes must be an object" });
      return;
    }
    const result = await catalogService.addVariant({
      productId: req.params.id,
      sku,
      priceCents,
      currency: currency as string | undefined,
      attributes: attributes as Record<string, string> | undefined,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  }));

  router.put("/products/:id/price", asyncHandler(async (req: Request, res: Response) => {
    const { priceCents, currency } = req.body as Record<string, unknown>;
    if (typeof priceCents !== "number") {
      res.status(400).json({ error: "priceCents (number) is required" });
      return;
    }
    if (currency !== undefined && typeof currency !== "string") {
      res.status(400).json({ error: "currency must be a string" });
      return;
    }
    const result = await catalogService.updatePrice({
      productId: req.params.id,
      priceCents,
      currency: currency as string | undefined,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  }));

  // Categories
  router.post("/categories", asyncHandler(async (req: Request, res: Response) => {
    const { name, slug, parentId } = req.body as Record<string, unknown>;
    if (typeof name !== "string" || typeof slug !== "string") {
      res.status(400).json({ error: "name (string) and slug (string) are required" });
      return;
    }
    if (parentId !== undefined && typeof parentId !== "string") {
      res.status(400).json({ error: "parentId must be a string" });
      return;
    }
    const result = await catalogService.createCategory({
      name,
      slug,
      parentId: parentId as string | undefined,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  }));

  router.get("/categories/:id/products", asyncHandler(async (req: Request, res: Response) => {
    const result = await catalogService.listByCategory(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  }));

  return router;
}
