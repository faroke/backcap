// Template: import type { ICartRepository } from "{{cap_rel}}/cart/application/ports/cart-repository.port.js";
import type { ICartRepository } from "../../../capabilities/cart/application/ports/cart-repository.port.js";
// Template: import { Cart } from "{{cap_rel}}/cart/domain/entities/cart.entity.js";
import { Cart } from "../../../capabilities/cart/domain/entities/cart.entity.js";
// Template: import { CartItem } from "{{cap_rel}}/cart/domain/entities/cart-item.entity.js";
import { CartItem } from "../../../capabilities/cart/domain/entities/cart-item.entity.js";

interface PrismaCartItemRecord {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPriceCents: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaCartRecord {
  id: string;
  userId: string | null;
  status: string;
  maxItems: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  items?: PrismaCartItemRecord[];
}

interface PrismaCartDelegate {
  findUnique(args: { where: { id?: string }; include?: { items: boolean } }): Promise<PrismaCartRecord | null>;
  findFirst(args: { where: { userId?: string }; include?: { items: boolean } }): Promise<PrismaCartRecord | null>;
  create(args: { data: Omit<PrismaCartRecord, "items">; include?: { items: boolean } }): Promise<PrismaCartRecord>;
  update(args: { where: { id: string }; data: Omit<PrismaCartRecord, "items">; include?: { items: boolean } }): Promise<PrismaCartRecord>;
}

interface PrismaCartItemDelegate {
  createMany(args: { data: PrismaCartItemRecord[] }): Promise<{ count: number }>;
  deleteMany(args: { where: { cartId: string } }): Promise<{ count: number }>;
}

interface PrismaClient {
  cart: PrismaCartDelegate;
  cartItem: PrismaCartItemDelegate;
  $transaction: (fn: (tx: PrismaClient) => Promise<void>) => Promise<void>;
}

export class PrismaCartRepository implements ICartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Cart | null> {
    const record = await this.prisma.cart.findUnique({
      where: { id },
      include: { items: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    const record = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(cart: Cart): Promise<void> {
    const data = this.toPrisma(cart);
    const itemData = cart.items.map((i) => this.toItemPrisma(cart.id, i));

    await this.prisma.$transaction(async (tx) => {
      await tx.cart.create({ data });
      if (itemData.length > 0) {
        await tx.cartItem.createMany({ data: itemData });
      }
    });
  }

  async update(cart: Cart): Promise<void> {
    const data = this.toPrisma(cart);
    const itemData = cart.items.map((i) => this.toItemPrisma(cart.id, i));

    await this.prisma.$transaction(async (tx) => {
      await tx.cart.update({ where: { id: cart.id }, data });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      if (itemData.length > 0) {
        await tx.cartItem.createMany({ data: itemData });
      }
    });
  }

  private toDomain(record: PrismaCartRecord): Cart {
    const items = (record.items ?? []).map((i) => {
      const result = CartItem.create({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
        currency: i.currency,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      });
      if (result.isFail()) {
        throw new Error(`Corrupt cart item data for cart ${record.id}: ${result.unwrapError().message}`);
      }
      return result.unwrap();
    });

    const result = Cart.create({
      id: record.id,
      userId: record.userId,
      status: record.status,
      items,
      maxItems: record.maxItems,
      currency: record.currency,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
    if (result.isFail()) {
      throw new Error(`Corrupt cart data for id ${record.id}: ${result.unwrapError().message}`);
    }
    return result.unwrap();
  }

  private toPrisma(cart: Cart): Omit<PrismaCartRecord, "items"> {
    return {
      id: cart.id,
      userId: cart.userId,
      status: cart.status.value,
      maxItems: cart.maxItems,
      currency: cart.currency,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  private toItemPrisma(cartId: string, item: CartItem): PrismaCartItemRecord {
    return {
      id: item.id,
      cartId,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity.value,
      unitPriceCents: item.unitPriceCents,
      currency: item.currency,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
