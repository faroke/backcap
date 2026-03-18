import type { ITokenService } from "../../ports/token-service.port.js";

export class InMemoryTokenService implements ITokenService {
  private tokens = new Map<string, { userId: string; organizationId?: string }>();

  async generate(userId: string, _roles: string[], organizationId?: string): Promise<string> {
    const token = `token-${userId}-${Date.now()}`;
    this.tokens.set(token, { userId, organizationId });
    return token;
  }

  async verify(token: string): Promise<{ userId: string; organizationId?: string } | null> {
    return this.tokens.get(token) ?? null;
  }
}
