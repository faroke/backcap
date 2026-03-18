import type { ICartService } from "../../../capabilities/cart/contracts/index.js";
import { CartNotFound } from "../../../capabilities/cart/domain/errors/cart-not-found.error.js";
import { ItemNotInCart } from "../../../capabilities/cart/domain/errors/item-not-in-cart.error.js";
import { CartLimitExceeded } from "../../../capabilities/cart/domain/errors/cart-limit-exceeded.error.js";
import { InvalidQuantity } from "../../../capabilities/cart/domain/errors/invalid-quantity.error.js";

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
  delete(path: string, handler: RequestHandler): void;
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof CartNotFound) return { status: 404, message: error.message };
  if (error instanceof ItemNotInCart) return { status: 404, message: error.message };
  if (error instanceof CartLimitExceeded) return { status: 422, message: error.message };
  if (error instanceof InvalidQuantity) return { status: 400, message: error.message };
  if (error.name === "CartNotFound") return { status: 404, message: error.message };
  if (error.name === "ItemNotInCart") return { status: 404, message: error.message };
  if (error.name === "CartLimitExceeded") return { status: 422, message: error.message };
  if (error.name === "InvalidQuantity") return { status: 400, message: error.message };
  return { status: 500, message: "Internal server error" };
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export function createCartRouter(cartService: ICartService, router: Router): Router {
  router.get("/carts/:id", asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.getCart(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  }));

  router.post("/carts/:id/items", asyncHandler(async (req: Request, res: Response) => {
    const { productId, variantId, quantity } = req.body as Record<string, unknown>;
    if (typeof productId !== "string" || typeof variantId !== "string") {
      res.status(400).json({ error: "productId (string) and variantId (string) are required" });
      return;
    }
    if (!isPositiveInteger(quantity)) {
      res.status(400).json({ error: "quantity must be a positive integer" });
      return;
    }

    const result = await cartService.addToCart({
      cartId: req.params.id,
      productId,
      variantId,
      quantity,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  }));

  router.delete("/carts/:id/items/:variantId", asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.removeFromCart({
      cartId: req.params.id,
      variantId: req.params.variantId,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  }));

  router.put("/carts/:id/items/:variantId/quantity", asyncHandler(async (req: Request, res: Response) => {
    const { quantity } = req.body as Record<string, unknown>;
    if (!isPositiveInteger(quantity)) {
      res.status(400).json({ error: "quantity must be a positive integer" });
      return;
    }

    const result = await cartService.updateQuantity({
      cartId: req.params.id,
      variantId: req.params.variantId,
      quantity,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  }));

  router.post("/carts/:id/clear", asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.clearCart(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  }));

  router.post("/carts/:id/abandon", asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.abandonCart(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  }));

  router.post("/carts/:id/convert", asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.convertCart(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  }));

  return router;
}
