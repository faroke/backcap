/**
 * Simple password hasher for demo purposes.
 * Replace with bcrypt/argon2 for production use.
 */
export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export class SimplePasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    // Demo only — NOT secure for production
    return `hashed:${plain}`;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
}
