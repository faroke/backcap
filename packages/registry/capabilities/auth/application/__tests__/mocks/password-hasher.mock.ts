import type { IPasswordHasher } from "../../ports/password-hasher.port.js";

export class InMemoryPasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
}
