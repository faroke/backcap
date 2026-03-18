import type { Customer } from "../../../domain/entities/customer.entity.js";
import type { ICustomerRepository } from "../../ports/customer-repository.port.js";

export class InMemoryCustomerRepository implements ICustomerRepository {
  private store = new Map<string, Customer>();

  async findById(id: string): Promise<Customer | null> {
    return this.store.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return [...this.store.values()].find((c) => c.email === email) ?? null;
  }

  async save(customer: Customer): Promise<void> {
    this.store.set(customer.id, customer);
  }
}
