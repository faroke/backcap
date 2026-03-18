import type { IProductRepository } from "../application/ports/product-repository.port.js";
import type { ICategoryRepository } from "../application/ports/category-repository.port.js";
import { CreateProduct } from "../application/use-cases/create-product.use-case.js";
import { PublishProduct } from "../application/use-cases/publish-product.use-case.js";
import { AddVariant } from "../application/use-cases/add-variant.use-case.js";
import { UpdatePrice } from "../application/use-cases/update-price.use-case.js";
import { ListProducts } from "../application/use-cases/list-products.use-case.js";
import { GetProduct } from "../application/use-cases/get-product.use-case.js";
import { CreateCategory } from "../application/use-cases/create-category.use-case.js";
import { ListByCategory } from "../application/use-cases/list-by-category.use-case.js";
import type { ICatalogService } from "./catalog.contract.js";
import { Result } from "../shared/result.js";

export type CatalogServiceDeps = {
  productRepository: IProductRepository;
  categoryRepository: ICategoryRepository;
};

export function createCatalogService(deps: CatalogServiceDeps): ICatalogService {
  const createProduct = new CreateProduct(deps.productRepository);
  const publishProduct = new PublishProduct(deps.productRepository);
  const addVariant = new AddVariant(deps.productRepository);
  const updatePrice = new UpdatePrice(deps.productRepository);
  const listProducts = new ListProducts(deps.productRepository);
  const getProduct = new GetProduct(deps.productRepository);
  const createCategory = new CreateCategory(deps.categoryRepository);
  const listByCategory = new ListByCategory(deps.productRepository, deps.categoryRepository);

  return {
    createProduct: (input) =>
      createProduct.execute(input).then((r) =>
        r.isOk() ? Result.ok({ productId: r.unwrap().productId }) : Result.fail(r.unwrapError()),
      ),
    publishProduct: (productId) =>
      publishProduct.execute(productId).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    addVariant: (input) =>
      addVariant.execute(input).then((r) =>
        r.isOk() ? Result.ok({ variantId: r.unwrap().variantId }) : Result.fail(r.unwrapError()),
      ),
    updatePrice: (input) => updatePrice.execute(input),
    listProducts: () => listProducts.execute(),
    getProduct: (productId) => getProduct.execute(productId),
    createCategory: (input) => createCategory.execute(input),
    listByCategory: (categoryId) => listByCategory.execute(categoryId),
  };
}
