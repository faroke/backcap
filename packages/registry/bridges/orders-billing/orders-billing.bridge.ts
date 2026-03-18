import type { IEventBus } from "../../../shared/src/event-bus.port.js";
import type { Bridge } from "../../../shared/src/bridge.js";

interface OrderPlacedEvent {
  orderId: string;
  totalCents: number;
  itemCount: number;
  occurredAt: Date;
}

interface PaymentSucceededEvent {
  customerId: string;
  amount: number;
  currency: string;
  occurredAt: Date;
}

interface PaymentFailedEvent {
  customerId: string;
  amount: number;
  currency: string;
  reason: string;
  occurredAt: Date;
}

interface ProcessPaymentInput {
  customerId: string;
  amount: number;
  currency: string;
  description?: string;
}

interface ProcessPaymentResult {
  isOk(): boolean;
  isFail(): boolean;
  unwrap(): { transactionId: string; event: PaymentSucceededEvent };
  unwrapError(): Error;
}

export interface IProcessPayment {
  execute(input: ProcessPaymentInput): Promise<ProcessPaymentResult>;
}

interface ConfirmOrderResult {
  isOk(): boolean;
  isFail(): boolean;
  unwrapError(): Error;
}

export interface IConfirmOrder {
  execute(orderId: string): Promise<ConfirmOrderResult>;
}

interface PaymentRetryRequestedEvent {
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  reason: string;
  occurredAt: Date;
}

export interface OrdersBillingBridgeDeps {
  processPayment: IProcessPayment;
  confirmOrder: IConfirmOrder;
  resolveCustomerId: (orderId: string) => Promise<string | null>;
  resolveOrderId: (customerId: string) => Promise<string | null>;
  currency?: string;
}

export function createBridge(deps: OrdersBillingBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<OrderPlacedEvent>("OrderPlaced", async (event) => {
        try {
          const customerId = await deps.resolveCustomerId(event.orderId);

          if (!customerId) {
            console.error("[orders-billing] Cannot resolve customerId for order:", event.orderId);
            return;
          }

          const result = await deps.processPayment.execute({
            customerId,
            amount: event.totalCents,
            currency: deps.currency ?? "USD",
            description: `Payment for order ${event.orderId}`,
          });

          if (result.isFail()) {
            console.error("[orders-billing] ProcessPayment failed for order:", event.orderId, result.unwrapError());
            return;
          }

          // Payment succeeded synchronously — confirm the order immediately.
          // This avoids the customerId→orderId reverse-lookup ambiguity.
          const confirmResult = await deps.confirmOrder.execute(event.orderId);

          if (confirmResult.isFail()) {
            console.error("[orders-billing] ConfirmOrder failed after payment for order:", event.orderId, confirmResult.unwrapError());
          }
        } catch (error) {
          console.error("[orders-billing] Failed to process payment for OrderPlaced:", error);
        }
      });

      eventBus.subscribe<PaymentSucceededEvent>("PaymentSucceeded", async (event) => {
        try {
          const orderId = await deps.resolveOrderId(event.customerId);

          if (!orderId) {
            console.warn("[orders-billing] PaymentSucceeded but no pending order found for customer:", event.customerId);
            return;
          }

          const result = await deps.confirmOrder.execute(orderId);

          if (result.isFail()) {
            console.error("[orders-billing] ConfirmOrder failed:", orderId, result.unwrapError());
          }
        } catch (error) {
          console.error("[orders-billing] Failed to confirm order on PaymentSucceeded:", error);
        }
      });

      eventBus.subscribe<PaymentFailedEvent>("PaymentFailed", async (event) => {
        try {
          const orderId = await deps.resolveOrderId(event.customerId);

          if (!orderId) {
            console.warn("[orders-billing] PaymentFailed but no pending order found for customer:", event.customerId);
            return;
          }

          console.warn(
            `[orders-billing] Payment failed for order ${orderId} (customer: ${event.customerId}): ${event.reason}. Publishing retry request.`,
          );

          try {
            await eventBus.publish<PaymentRetryRequestedEvent>("PaymentRetryRequested", {
              orderId,
              customerId: event.customerId,
              amount: event.amount,
              currency: event.currency,
              reason: event.reason,
              occurredAt: new Date(),
            });
          } catch (publishError) {
            console.error("[orders-billing] Failed to publish PaymentRetryRequested:", publishError);
          }
        } catch (error) {
          console.error("[orders-billing] Failed to handle PaymentFailed:", error);
        }
      });
    },
  };
}
