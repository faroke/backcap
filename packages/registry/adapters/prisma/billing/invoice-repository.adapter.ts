// Template: import type { IInvoiceRepository } from "{{cap_rel}}/billing/application/ports/invoice-repository.port.js";
import type { IInvoiceRepository } from "../../../capabilities/billing/application/ports/invoice-repository.port.js";
// Template: import { Invoice, type InvoiceStatus } from "{{cap_rel}}/billing/domain/entities/invoice.entity.js";
import { Invoice, type InvoiceStatus } from "../../../capabilities/billing/domain/entities/invoice.entity.js";

interface PrismaInvoiceRecord {
  id: string;
  customerId: string;
  subscriptionId: string | null;
  amountValue: number;
  amountCurrency: string;
  status: string;
  dueDate: Date;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaInvoiceDelegate {
  findUnique(args: { where: { id: string } }): Promise<PrismaInvoiceRecord | null>;
  findMany(args: { where: { customerId: string } }): Promise<PrismaInvoiceRecord[]>;
  create(args: { data: PrismaInvoiceRecord }): Promise<PrismaInvoiceRecord>;
  upsert(args: { where: { id: string }; create: PrismaInvoiceRecord; update: PrismaInvoiceRecord }): Promise<PrismaInvoiceRecord>;
}

interface PrismaClient {
  billingInvoice: PrismaInvoiceDelegate;
}

export class PrismaInvoiceRepository implements IInvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Invoice | null> {
    const record = await this.prisma.billingInvoice.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByCustomerId(customerId: string): Promise<Invoice[]> {
    const records = await this.prisma.billingInvoice.findMany({ where: { customerId } });
    return records.map((r) => this.toDomain(r));
  }

  async save(invoice: Invoice): Promise<void> {
    const data = this.toPrisma(invoice);
    await this.prisma.billingInvoice.upsert({
      where: { id: invoice.id },
      create: data,
      update: data,
    });
  }

  private toDomain(record: PrismaInvoiceRecord): Invoice {
    const result = Invoice.create({
      id: record.id,
      customerId: record.customerId,
      subscriptionId: record.subscriptionId ?? undefined,
      amountValue: record.amountValue,
      amountCurrency: record.amountCurrency,
      status: record.status,
      dueDate: record.dueDate,
      paidAt: record.paidAt ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
    if (result.isFail()) {
      throw new Error(`Failed to hydrate Invoice from DB: ${result.unwrapError().message}`);
    }
    return result.unwrap();
  }

  private toPrisma(invoice: Invoice): PrismaInvoiceRecord {
    return {
      id: invoice.id,
      customerId: invoice.customerId,
      subscriptionId: invoice.subscriptionId ?? null,
      amountValue: invoice.amount.amount,
      amountCurrency: invoice.amount.currency,
      status: invoice.status,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt ?? null,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}
