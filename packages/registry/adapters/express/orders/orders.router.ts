import type { IOrderService } from "../../../capabilities/orders/contracts/index.js";
import { OrderNotFound } from "../../../capabilities/orders/domain/errors/order-not-found.error.js";
import { InvalidOrderTransition } from "../../../capabilities/orders/domain/errors/invalid-order-transition.error.js";
import { OrderAlreadyCanceled } from "../../../capabilities/orders/domain/errors/order-already-canceled.error.js";

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
  if (error instanceof OrderNotFound) return { status: 404, message: error.message };
  if (error instanceof InvalidOrderTransition) return { status: 422, message: error.message };
  if (error instanceof OrderAlreadyCanceled) return { status: 422, message: error.message };
  if (error.name === "OrderNotFound") return { status: 404, message: error.message };
  if (error.name === "InvalidOrderTransition") return { status: 422, message: error.message };
  if (error.name === "OrderAlreadyCanceled") return { status: 422, message: error.message };
  return { status: 500, message: "Internal server error" };
}

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export function createOrdersRouter(orderService: IOrderService, router: Router): Router {
  router.get("/orders", asyncHandler(async (_req: Request, res: Response) => {
    const result = await orderService.listOrders();

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  }));

  router.get("/orders/:id", asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.getOrder(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  }));

  router.post("/orders", asyncHandler(async (req: Request, res: Response) => {
    const { items, shippingAddress, billingAddress } = req.body as Record<string, unknown>;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "items (non-empty array) is required" });
      return;
    }
    if (!shippingAddress || typeof shippingAddress !== "object") {
      res.status(400).json({ error: "shippingAddress is required" });
      return;
    }
    if (!billingAddress || typeof billingAddress !== "object") {
      res.status(400).json({ error: "billingAddress is required" });
      return;
    }

    const result = await orderService.placeOrder({
      items: items as { productId: string; quantity: number; unitPriceCents: number }[],
      shippingAddress: shippingAddress as { street: string; city: string; country: string; postalCode: string },
      billingAddress: billingAddress as { street: string; city: string; country: string; postalCode: string },
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  }));

  router.post("/orders/:id/confirm", asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.confirmOrder(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  }));

  router.post("/orders/:id/ship", asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.shipOrder(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  }));

  router.post("/orders/:id/cancel", asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.cancelOrder(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json({ success: true });
  }));

  return router;
}
