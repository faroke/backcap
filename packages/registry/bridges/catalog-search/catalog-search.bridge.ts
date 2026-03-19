// Template: import type { IEventBus } from "{{shared_rel}}/event-bus.port.js";
import type { IEventBus } from "../../../shared/src/event-bus.port.js";
// Template: import type { Bridge } from "{{shared_rel}}/bridge.js";
import type { Bridge } from "../../../shared/src/bridge.js";

interface ProductPublishedEvent {
  productId: string;
  occurredAt: Date;
}

interface ProductVariantOutput {
  id: string;
  sku: string;
  priceCents: number;
  currency: string;
  attributes: Record<string, string>;
}

interface ProductOutput {
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
  unwrapError(): Error;
}

export interface IGetProduct {
  execute(productId: string): Promise<GetProductResult>;
}

export interface IndexDocumentInput {
  indexName: string;
  documentId: string;
  document: Record<string, unknown>;
}

interface IndexDocumentResult {
  isOk(): boolean;
  isFail(): boolean;
  unwrapError(): Error;
}

export interface IIndexDocument {
  execute(input: IndexDocumentInput): Promise<IndexDocumentResult>;
}

export interface CatalogSearchBridgeDeps {
  getProduct: IGetProduct;
  indexDocument: IIndexDocument;
}

export function createBridge(deps: CatalogSearchBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<ProductPublishedEvent>("ProductPublished", async (event) => {
        try {
          const result = await deps.getProduct.execute(event.productId);

          if (result.isFail()) {
            console.error("[catalog-search] Failed to fetch product:", event.productId, result.unwrapError());
            return;
          }

          const product = result.unwrap();

          if (product.status !== "published") {
            console.warn("[catalog-search] Product is not published, skipping indexing:", event.productId);
            return;
          }

          const indexResult = await deps.indexDocument.execute({
            indexName: "products",
            documentId: product.id,
            document: {
              name: product.name,
              description: product.description,
              basePriceCents: product.basePriceCents,
              currency: product.currency,
              categoryId: product.categoryId,
              variants: product.variants.map((v) => ({
                sku: v.sku,
                priceCents: v.priceCents,
                attributes: v.attributes,
              })),
              publishedAt: event.occurredAt,
            },
          });

          if (indexResult.isFail()) {
            console.error("[catalog-search] IndexDocument failed for product:", event.productId, indexResult.unwrapError());
          }
        } catch (error) {
          console.error("[catalog-search] Failed to index ProductPublished:", error);
        }
      });
    },
  };
}
