import type { Invoice } from "../../domain/entities/invoice.entity.js";

export interface IInvoiceRepository {
  findById(id: string): Promise<Invoice | null>;
  findByCustomerId(customerId: string): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<void>;
}
