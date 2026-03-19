// Template: import type { IProductRepository } from "{{cap_rel}}/catalog/application/ports/product-repository.port.js";
import type { IProductRepository } from "../../../capabilities/catalog/application/ports/product-repository.port.js";
// Template: import { Product } from "{{cap_rel}}/catalog/domain/entities/product.entity.js";
import { Product } from "../../../capabilities/catalog/domain/entities/product.entity.js";
// Template: import { ProductVariant } from "{{cap_rel}}/catalog/domain/entities/product-variant.entity.js";
import { ProductVariant } from "../../../capabilities/catalog/domain/entities/product-variant.entity.js";

interface PrismaProductVariantRecord {
  id: string;
  productId: string;
  sku: string;
  priceCents: number;
  currency: string;
  attributes: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaProductRecord {
  id: string;
  name: string;
  description: string;
  status: string;
  basePriceCents: number;
  currency: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  variants?: PrismaProductVariantRecord[];
}

interface PrismaProductDelegate {
  findUnique(args: { where: { id: string }; include?: { variants: boolean } }): Promise<PrismaProductRecord | null>;
  findMany(args?: { where?: { categoryId?: string }; include?: { variants: boolean } }): Promise<PrismaProductRecord[]>;
  create(args: { data: Omit<PrismaProductRecord, "variants">; include?: { variants: boolean } }): Promise<PrismaProductRecord>;
  update(args: { where: { id: string }; data: Omit<PrismaProductRecord, "variants">; include?: { variants: boolean } }): Promise<PrismaProductRecord>;
}

interface PrismaProductVariantDelegate {
  createMany(args: { data: PrismaProductVariantRecord[] }): Promise<{ count: number }>;
  deleteMany(args: { where: { productId: string } }): Promise<{ count: number }>;
}

interface PrismaClient {
  product: PrismaProductDelegate;
  productVariant: PrismaProductVariantDelegate;
  $transaction?: (operations: unknown[]) => Promise<unknown>;
}

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(product: Product): Promise<void> {
    const operations: Array<Promise<unknown>> = [
      this.prisma.product.create({ data: this.toPrisma(product) }),
    ];
    if (product.variants.length > 0) {
      operations.push(
        this.prisma.productVariant.createMany({
          data: product.variants.map((v) => this.toVariantPrisma(v)),
        }),
      );
    }
    if (this.prisma.$transaction) {
      await this.prisma.$transaction(operations as never);
    } else {
      for (const op of operations) await op;
    }
  }

  async update(product: Product): Promise<void> {
    const operations: Array<Promise<unknown>> = [
      this.prisma.product.update({ where: { id: product.id }, data: this.toPrisma(product) }),
      this.prisma.productVariant.deleteMany({ where: { productId: product.id } }),
    ];
    if (product.variants.length > 0) {
      operations.push(
        this.prisma.productVariant.createMany({
          data: product.variants.map((v) => this.toVariantPrisma(v)),
        }),
      );
    }
    if (this.prisma.$transaction) {
      await this.prisma.$transaction(operations as never);
    } else {
      for (const op of operations) await op;
    }
  }

  async findAll(): Promise<Product[]> {
    const records = await this.prisma.product.findMany({ include: { variants: true } });
    return records.map((r) => this.toDomain(r));
  }

  async findByCategoryId(categoryId: string): Promise<Product[]> {
    const records = await this.prisma.product.findMany({
      where: { categoryId },
      include: { variants: true },
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: PrismaProductRecord): Product {
    const variants = (record.variants ?? []).map((v) => {
      const result = ProductVariant.create({
        id: v.id,
        productId: v.productId,
        sku: v.sku,
        priceCents: v.priceCents,
        currency: v.currency,
        attributes: v.attributes,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      });
      if (result.isFail()) {
        throw new Error(`Corrupt variant data for product ${record.id}: ${result.unwrapError().message}`);
      }
      return result.unwrap();
    });

    const result = Product.create({
      id: record.id,
      name: record.name,
      description: record.description,
      basePriceCents: record.basePriceCents,
      currency: record.currency,
      status: record.status,
      categoryId: record.categoryId,
      variants,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
    if (result.isFail()) {
      throw new Error(`Corrupt product data for id ${record.id}: ${result.unwrapError().message}`);
    }
    return result.unwrap();
  }

  private toPrisma(product: Product): Omit<PrismaProductRecord, "variants"> {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      status: product.status.value,
      basePriceCents: product.basePrice.cents,
      currency: product.basePrice.currency,
      categoryId: product.categoryId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private toVariantPrisma(variant: ProductVariant): PrismaProductVariantRecord {
    return {
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku.value,
      priceCents: variant.price.cents,
      currency: variant.price.currency,
      attributes: variant.attributes,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }
}
