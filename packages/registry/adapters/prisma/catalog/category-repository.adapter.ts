// Template: import type { ICategoryRepository } from "{{cap_rel}}/catalog/application/ports/category-repository.port.js";
import type { ICategoryRepository } from "../../../capabilities/catalog/application/ports/category-repository.port.js";
// Template: import { Category } from "{{cap_rel}}/catalog/domain/entities/category.entity.js";
import { Category } from "../../../capabilities/catalog/domain/entities/category.entity.js";

interface PrismaCategoryRecord {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaCategoryDelegate {
  findUnique(args: { where: { id?: string; slug?: string } }): Promise<PrismaCategoryRecord | null>;
  findMany(): Promise<PrismaCategoryRecord[]>;
  create(args: { data: PrismaCategoryRecord }): Promise<PrismaCategoryRecord>;
}

interface PrismaClient {
  category: PrismaCategoryDelegate;
}

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Category | null> {
    const record = await this.prisma.category.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const record = await this.prisma.category.findUnique({ where: { slug } });
    return record ? this.toDomain(record) : null;
  }

  async save(category: Category): Promise<void> {
    await this.prisma.category.create({ data: this.toPrisma(category) });
  }

  async findAll(): Promise<Category[]> {
    const records = await this.prisma.category.findMany();
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: PrismaCategoryRecord): Category {
    const result = Category.create({
      id: record.id,
      name: record.name,
      slug: record.slug,
      parentId: record.parentId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
    if (result.isFail()) {
      throw new Error(`Corrupt category data for id ${record.id}: ${result.unwrapError().message}`);
    }
    return result.unwrap();
  }

  private toPrisma(category: Category): PrismaCategoryRecord {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
