// Template: import type { IOrderRepository } from "{{cap_rel}}/orders/application/ports/order-repository.port.js";
import type { IOrderRepository } from "../../../capabilities/orders/application/ports/order-repository.port.js";
// Template: import { Order } from "{{cap_rel}}/orders/domain/entities/order.entity.js";
import { Order } from "../../../capabilities/orders/domain/entities/order.entity.js";
// Template: import { OrderItem } from "{{cap_rel}}/orders/domain/entities/order-item.entity.js";
import { OrderItem } from "../../../capabilities/orders/domain/entities/order-item.entity.js";
// Template: import { Address } from "{{cap_rel}}/orders/domain/value-objects/address.vo.js";
import { Address } from "../../../capabilities/orders/domain/value-objects/address.vo.js";

interface PrismaOrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  createdAt: Date;
}

interface PrismaOrderRecord {
  id: string;
  status: string;
  shippingStreet: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string;
  billingStreet: string;
  billingCity: string;
  billingCountry: string;
  billingPostalCode: string;
  createdAt: Date;
  updatedAt: Date;
  items?: PrismaOrderItemRecord[];
}

interface PrismaOrderDelegate {
  findUnique(args: { where: { id: string }; include?: { items: boolean } }): Promise<PrismaOrderRecord | null>;
  findMany(args: { include?: { items: boolean } }): Promise<PrismaOrderRecord[]>;
  create(args: { data: Omit<PrismaOrderRecord, "items"> }): Promise<PrismaOrderRecord>;
  update(args: { where: { id: string }; data: Omit<PrismaOrderRecord, "items"> }): Promise<PrismaOrderRecord>;
}

interface PrismaOrderItemDelegate {
  createMany(args: { data: PrismaOrderItemRecord[] }): Promise<{ count: number }>;
  deleteMany(args: { where: { orderId: string } }): Promise<{ count: number }>;
}

interface PrismaClient {
  order: PrismaOrderDelegate;
  orderItem: PrismaOrderItemDelegate;
  $transaction?: (fn: (tx: PrismaClient) => Promise<void>) => Promise<void>;
}

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      include: { items: true },
    });
    return records.map((r) => this.toDomain(r));
  }

  async save(order: Order): Promise<void> {
    const data = this.toPrisma(order);
    const itemData = order.items.map((i) => this.toItemPrisma(order.id, i));

    if (this.prisma.$transaction) {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.create({ data });
        if (itemData.length > 0) {
          await tx.orderItem.createMany({ data: itemData });
        }
      });
    } else {
      await this.prisma.order.create({ data });
      if (itemData.length > 0) {
        await this.prisma.orderItem.createMany({ data: itemData });
      }
    }
  }

  async update(order: Order): Promise<void> {
    const data = this.toPrisma(order);
    const itemData = order.items.map((i) => this.toItemPrisma(order.id, i));

    if (this.prisma.$transaction) {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id: order.id }, data });
        await tx.orderItem.deleteMany({ where: { orderId: order.id } });
        if (itemData.length > 0) {
          await tx.orderItem.createMany({ data: itemData });
        }
      });
    } else {
      await this.prisma.order.update({ where: { id: order.id }, data });
      await this.prisma.orderItem.deleteMany({ where: { orderId: order.id } });
      if (itemData.length > 0) {
        await this.prisma.orderItem.createMany({ data: itemData });
      }
    }
  }

  private toDomain(record: PrismaOrderRecord): Order {
    const items = (record.items ?? []).map((i) => {
      const result = OrderItem.create({
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
        createdAt: i.createdAt,
      });
      if (result.isFail()) {
        throw new Error(`Corrupt order item data for order ${record.id}: ${result.unwrapError().message}`);
      }
      return result.unwrap();
    });

    const shippingAddress = Address.create({
      street: record.shippingStreet,
      city: record.shippingCity,
      country: record.shippingCountry,
      postalCode: record.shippingPostalCode,
    });
    if (shippingAddress.isFail()) {
      throw new Error(`Corrupt shipping address for order ${record.id}: ${shippingAddress.unwrapError().message}`);
    }

    const billingAddress = Address.create({
      street: record.billingStreet,
      city: record.billingCity,
      country: record.billingCountry,
      postalCode: record.billingPostalCode,
    });
    if (billingAddress.isFail()) {
      throw new Error(`Corrupt billing address for order ${record.id}: ${billingAddress.unwrapError().message}`);
    }

    const result = Order.create({
      id: record.id,
      items,
      status: record.status,
      shippingAddress: shippingAddress.unwrap(),
      billingAddress: billingAddress.unwrap(),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
    if (result.isFail()) {
      throw new Error(`Corrupt order data for id ${record.id}: ${result.unwrapError().message}`);
    }
    return result.unwrap();
  }

  private toPrisma(order: Order): Omit<PrismaOrderRecord, "items"> {
    return {
      id: order.id,
      status: order.status.value,
      shippingStreet: order.shippingAddress.street,
      shippingCity: order.shippingAddress.city,
      shippingCountry: order.shippingAddress.country,
      shippingPostalCode: order.shippingAddress.postalCode,
      billingStreet: order.billingAddress.street,
      billingCity: order.billingAddress.city,
      billingCountry: order.billingAddress.country,
      billingPostalCode: order.billingAddress.postalCode,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private toItemPrisma(orderId: string, item: OrderItem): PrismaOrderItemRecord {
    return {
      id: item.id,
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      createdAt: item.createdAt,
    };
  }
}
