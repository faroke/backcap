import type { Cart } from "../../domain/entities/cart.entity.js";

export interface ICartRepository {
  findById(id: string): Promise<Cart | null>;
  findByUserId(userId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
  update(cart: Cart): Promise<void>;
}
