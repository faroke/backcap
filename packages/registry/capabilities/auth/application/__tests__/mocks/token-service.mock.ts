import type { ITokenService } from "../../ports/token-service.port.js";

export class InMemoryTokenService implements ITokenService {
  private tokens = new Map<string, { userId: string }>();

  async generate(userId: string, _roles: string[]): Promise<string> {
    const token = `token-${userId}-${Date.now()}`;
    this.tokens.set(token, { userId });
    return token;
  }

  async verify(token: string): Promise<{ userId: string } | null> {
    return this.tokens.get(token) ?? null;
  }
}
