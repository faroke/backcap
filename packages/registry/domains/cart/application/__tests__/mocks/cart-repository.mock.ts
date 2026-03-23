import type { Cart } from "../../../domain/entities/cart.entity.js";
import type { ICartRepository } from "../../ports/cart-repository.port.js";

export class InMemoryCartRepository implements ICartRepository {
  private store = new Map<string, Cart>();

  async findById(id: string): Promise<Cart | null> {
    return this.store.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    for (const cart of this.store.values()) {
      if (cart.userId === userId) return cart;
    }
    return null;
  }

  async save(cart: Cart): Promise<void> {
    this.store.set(cart.id, cart);
  }

  async update(cart: Cart): Promise<void> {
    this.store.set(cart.id, cart);
  }
}
