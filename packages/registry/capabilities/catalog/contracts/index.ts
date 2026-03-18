export type {
  CatalogCreateProductInput,
  CatalogAddVariantInput,
  CatalogUpdatePriceInput,
  CatalogCreateCategoryInput,
  ICatalogService,
} from "./catalog.contract.js";

export { createCatalogService } from "./catalog.factory.js";
export type { CatalogServiceDeps } from "./catalog.factory.js";
