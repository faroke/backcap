// Template: import type { IEventBus } from "{{shared_rel}}/event-bus.port.js";
import type { IEventBus } from "../../../shared/src/event-bus.port.js";
// Template: import type { Bridge } from "{{shared_rel}}/bridge.js";
import type { Bridge } from "../../../shared/src/bridge.js";

interface CartConvertedEvent {
  cartId: string;
  occurredAt: Date;
}

interface CartItemOutput {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPriceCents: number;
  currency: string;
  lineTotal: number;
}

interface CartOutput {
  id: string;
  userId: string | null;
  status: string;
  items: CartItemOutput[];
  totalCents: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface GetCartResult {
  isOk(): boolean;
  isFail(): boolean;
  unwrap(): CartOutput;
}

export interface IGetCart {
  execute(cartId: string): Promise<GetCartResult>;
}

interface PlaceOrderItemInput {
  productId: string;
  quantity: number;
  unitPriceCents: number;
}

interface AddressInput {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

interface PlaceOrderInput {
  items: PlaceOrderItemInput[];
  shippingAddress: AddressInput;
  billingAddress: AddressInput;
}

interface PlaceOrderResult {
  isOk(): boolean;
  isFail(): boolean;
  unwrap(): { orderId: string };
  unwrapError(): Error;
}

export interface IPlaceOrder {
  execute(input: PlaceOrderInput): Promise<PlaceOrderResult>;
}

interface OrderPlacedEvent {
  orderId: string;
  totalCents: number;
  itemCount: number;
  occurredAt: Date;
}

export interface CartOrdersBridgeDeps {
  getCart: IGetCart;
  placeOrder: IPlaceOrder;
  defaultAddress: AddressInput;
}

export function createBridge(deps: CartOrdersBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<CartConvertedEvent>("CartConverted", async (event) => {
        try {
          const cartResult = await deps.getCart.execute(event.cartId);

          if (cartResult.isFail()) {
            console.error("[cart-orders] Failed to retrieve cart:", event.cartId);
            return;
          }

          const cart = cartResult.unwrap();

          if (cart.items.length === 0) {
            console.error("[cart-orders] Cart is empty, skipping order placement:", event.cartId);
            return;
          }

          const items: PlaceOrderItemInput[] = cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
          }));

          const orderResult = await deps.placeOrder.execute({
            items,
            shippingAddress: deps.defaultAddress,
            billingAddress: deps.defaultAddress,
          });

          if (orderResult.isFail()) {
            console.error("[cart-orders] PlaceOrder failed:", orderResult.unwrapError());
            return;
          }

          const { orderId } = orderResult.unwrap();
          const totalCents = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);

          try {
            await eventBus.publish<OrderPlacedEvent>("OrderPlaced", {
              orderId,
              totalCents,
              itemCount: cart.items.length,
              occurredAt: new Date(),
            });
          } catch (publishError) {
            console.error("[cart-orders] Failed to publish OrderPlaced:", publishError);
          }
        } catch (error) {
          console.error("[cart-orders] Failed to convert cart to order:", error);
        }
      });
    },
  };
}
