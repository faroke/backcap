// Template: import type { IBillingService } from "{{cap_rel}}/billing/contracts/index.js";
import type { IBillingService } from "../../../capabilities/billing/contracts/index.js";
// Template: import { CustomerNotFound } from "{{cap_rel}}/billing/domain/errors/customer-not-found.error.js";
import { CustomerNotFound } from "../../../capabilities/billing/domain/errors/customer-not-found.error.js";
// Template: import { SubscriptionNotFound } from "{{cap_rel}}/billing/domain/errors/subscription-not-found.error.js";
import { SubscriptionNotFound } from "../../../capabilities/billing/domain/errors/subscription-not-found.error.js";
// Template: import { InvalidPlan } from "{{cap_rel}}/billing/domain/errors/invalid-plan.error.js";
import { InvalidPlan } from "../../../capabilities/billing/domain/errors/invalid-plan.error.js";
// Template: import { PaymentDeclined } from "{{cap_rel}}/billing/domain/errors/payment-declined.error.js";
import { PaymentDeclined } from "../../../capabilities/billing/domain/errors/payment-declined.error.js";
// Template: import { InvoiceNotFound } from "{{cap_rel}}/billing/domain/errors/invoice-not-found.error.js";
import { InvoiceNotFound } from "../../../capabilities/billing/domain/errors/invoice-not-found.error.js";

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
  post(path: string, handler: RequestHandler): void;
  get(path: string, handler: RequestHandler): void;
  delete(path: string, handler: RequestHandler): void;
  put(path: string, handler: RequestHandler): void;
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof CustomerNotFound) return { status: 404, message: error.message };
  if (error instanceof SubscriptionNotFound) return { status: 404, message: error.message };
  if (error instanceof InvoiceNotFound) return { status: 404, message: error.message };
  if (error instanceof InvalidPlan) return { status: 400, message: error.message };
  if (error instanceof PaymentDeclined) return { status: 402, message: error.message };
  return { status: 500, message: "Internal server error" };
}

function requireFields(body: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return `Missing required field: "${field}"`;
    }
  }
  return null;
}

export function createBillingRouter(billingService: IBillingService, router: Router): Router {
  // Subscriptions
  router.post("/billing/subscriptions", async (req: Request, res: Response) => {
    try {
      const missing = requireFields(req.body, ["customerId", "planId", "priceAmount", "priceCurrency", "billingInterval"]);
      if (missing) { res.status(400).json({ error: missing }); return; }

      const { customerId, planId, priceAmount, priceCurrency, billingInterval } = req.body as {
        customerId: string; planId: string; priceAmount: number; priceCurrency: string; billingInterval: "monthly" | "yearly";
      };
      if (typeof priceAmount !== "number" || !Number.isInteger(priceAmount)) {
        res.status(400).json({ error: "priceAmount must be an integer (cents)" }); return;
      }
      if (billingInterval !== "monthly" && billingInterval !== "yearly") {
        res.status(400).json({ error: "billingInterval must be \"monthly\" or \"yearly\"" }); return;
      }
      const result = await billingService.createSubscription({ customerId, planId, priceAmount, priceCurrency, billingInterval });
      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }
      res.status(201).json(result.unwrap());
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.delete("/billing/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      const result = await billingService.cancelSubscription({
        subscriptionId: req.params.id,
        reason: req.body.reason as string | undefined,
      });
      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }
      res.status(200).json({ message: "Subscription canceled" });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.put("/billing/subscriptions/:id/plan", async (req: Request, res: Response) => {
    try {
      const missing = requireFields(req.body, ["newPlanId", "newPriceAmount", "newPriceCurrency"]);
      if (missing) { res.status(400).json({ error: missing }); return; }

      const { newPlanId, newPriceAmount, newPriceCurrency } = req.body as {
        newPlanId: string; newPriceAmount: number; newPriceCurrency: string;
      };
      if (typeof newPriceAmount !== "number" || !Number.isInteger(newPriceAmount)) {
        res.status(400).json({ error: "newPriceAmount must be an integer (cents)" }); return;
      }
      const result = await billingService.changeSubscriptionPlan({
        subscriptionId: req.params.id,
        newPlanId,
        newPriceAmount,
        newPriceCurrency,
      });
      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }
      res.status(200).json(result.unwrap());
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get("/billing/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      const result = await billingService.getSubscription(req.params.id);
      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }
      res.status(200).json(result.unwrap());
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Payments
  router.post("/billing/payments", async (req: Request, res: Response) => {
    try {
      const missing = requireFields(req.body, ["customerId", "amount", "currency"]);
      if (missing) { res.status(400).json({ error: missing }); return; }

      const { customerId, amount, currency, description } = req.body as {
        customerId: string; amount: number; currency: string; description?: string;
      };
      if (typeof amount !== "number" || !Number.isInteger(amount)) {
        res.status(400).json({ error: "amount must be an integer (cents)" }); return;
      }
      const result = await billingService.processPayment({ customerId, amount, currency, description });
      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }
      res.status(201).json(result.unwrap());
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post("/billing/payments/refund", async (req: Request, res: Response) => {
    try {
      const missing = requireFields(req.body, ["transactionId"]);
      if (missing) { res.status(400).json({ error: missing }); return; }

      const { transactionId, amount, currency } = req.body as {
        transactionId: string; amount?: number; currency?: string;
      };
      const result = await billingService.refundPayment({ transactionId, amount, currency });
      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }
      res.status(200).json(result.unwrap());
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get("/billing/payments/history/:customerId", async (req: Request, res: Response) => {
    try {
      const result = await billingService.getPaymentHistory(req.params.customerId);
      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }
      res.status(200).json(result.unwrap());
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Invoices — specific routes BEFORE parameterized routes
  router.get("/billing/invoices/customer/:customerId", async (req: Request, res: Response) => {
    try {
      const result = await billingService.listInvoices(req.params.customerId);
      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }
      res.status(200).json(result.unwrap());
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post("/billing/invoices", async (req: Request, res: Response) => {
    try {
      const missing = requireFields(req.body, ["customerId", "amountValue", "amountCurrency", "dueDate"]);
      if (missing) { res.status(400).json({ error: missing }); return; }

      const { customerId, subscriptionId, amountValue, amountCurrency, dueDate } = req.body as {
        customerId: string; subscriptionId?: string; amountValue: number; amountCurrency: string; dueDate: string;
      };
      if (typeof amountValue !== "number" || !Number.isInteger(amountValue)) {
        res.status(400).json({ error: "amountValue must be an integer (cents)" }); return;
      }
      const parsedDate = new Date(dueDate);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ error: "dueDate must be a valid date string" }); return;
      }
      const result = await billingService.generateInvoice({
        customerId,
        subscriptionId,
        amountValue,
        amountCurrency,
        dueDate: parsedDate,
      });
      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }
      res.status(201).json(result.unwrap());
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get("/billing/invoices/:id", async (req: Request, res: Response) => {
    try {
      const result = await billingService.getInvoice(req.params.id);
      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        res.status(status).json({ error: message });
        return;
      }
      res.status(200).json(result.unwrap());
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}
