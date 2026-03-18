import type { Invoice } from "../../../domain/entities/invoice.entity.js";
import type { IInvoiceRepository } from "../../ports/invoice-repository.port.js";

export class InMemoryInvoiceRepository implements IInvoiceRepository {
  private store = new Map<string, Invoice>();

  async findById(id: string): Promise<Invoice | null> {
    return this.store.get(id) ?? null;
  }

  async findByCustomerId(customerId: string): Promise<Invoice[]> {
    return [...this.store.values()].filter((i) => i.customerId === customerId);
  }

  async save(invoice: Invoice): Promise<void> {
    this.store.set(invoice.id, invoice);
  }
}
