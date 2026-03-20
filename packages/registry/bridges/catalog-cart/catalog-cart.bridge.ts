import type { Bridge } from "../../../shared/src/bridge.js";
import type { IEventBus } from "../../../shared/src/event-bus.port.js";

export interface ProductPriceInfo {
  productId: string;
  variantId: string;
  priceCents: number;
  currency: string;
}

export interface IProductPriceLookup {
  getPrice(productId: string, variantId: string): Promise<ProductPriceInfo | null>;
}

export interface ProductVariantOutput {
  id: string;
  sku: string;
  priceCents: number;
  currency: string;
  attributes: Record<string, string>;
}

export interface ProductOutput {
  id: string;
  name: string;
  description: string;
  status: string;
  basePriceCents: number;
  currency: string;
  categoryId: string | null;
  variants: ProductVariantOutput[];
  createdAt: Date;
  updatedAt: Date;
}

interface GetProductResult {
  isOk(): boolean;
  isFail(): boolean;
  unwrap(): ProductOutput;
}

export interface IGetProduct {
  execute(productId: string): Promise<GetProductResult>;
}

export interface CatalogCartBridgeDeps {
  getProduct: IGetProduct;
}

export function createPriceLookup(deps: CatalogCartBridgeDeps): IProductPriceLookup {
  return {
    async getPrice(productId: string, variantId: string): Promise<ProductPriceInfo | null> {
      try {
        const result = await deps.getProduct.execute(productId);

        if (result.isFail()) {
          return null;
        }

        const product = result.unwrap();

        if (product.status !== "published") {
          return null;
        }

        const variant = product.variants.find((v) => v.id === variantId);

        if (!variant) {
          return null;
        }

        return {
          productId: product.id,
          variantId: variant.id,
          priceCents: variant.priceCents,
          currency: variant.currency,
        };
      } catch (error) {
        console.error("[catalog-cart] Failed to look up product price:", error);
        return null;
      }
    },
  };
}

export function createBridge(): Bridge {
  return {
    wire(_eventBus: IEventBus): void {
      // This bridge is a dependency-injection bridge, not event-driven.
      // Wiring is a no-op; use createPriceLookup() to connect catalog → cart.
    },
  };
}
