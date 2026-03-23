import type { Customer } from "../../domain/entities/customer.entity.js";

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByExternalId(externalId: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
}
