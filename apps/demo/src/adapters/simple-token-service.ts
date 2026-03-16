/**
 * Simple token service for demo purposes.
 * Replace with JWT for production use.
 */
export interface ITokenService {
  sign(payload: { userId: string }): Promise<string>;
  verify(token: string): Promise<{ userId: string }>;
}

export class SimpleTokenService implements ITokenService {
  async sign(payload: { userId: string }): Promise<string> {
    // Demo only — NOT secure for production
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }

  async verify(token: string): Promise<{ userId: string }> {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    return { userId: decoded.userId };
  }
}
