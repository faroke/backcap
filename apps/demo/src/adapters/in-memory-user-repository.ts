/**
 * In-memory implementation of IUserRepository for demo purposes.
 * Replace with PrismaUserRepository for production use.
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, User>();

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
}
