import type { User } from "../../../domain/entities/user.entity.js";
import type { IUserRepository } from "../../ports/user-repository.port.js";

export class InMemoryUserRepository implements IUserRepository {
  private store = new Map<string, User>();

  async findByEmail(email: string): Promise<User | null> {
    return [...this.store.values()].find((u) => u.email.value === email) ?? null;
  }

  async save(user: User): Promise<void> {
    this.store.set(user.id, user);
  }

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }
}
