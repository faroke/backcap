export interface ITokenService {
  generate(userId: string, roles: string[], organizationId?: string): Promise<string>;
  verify(token: string): Promise<{ userId: string; organizationId?: string } | null>;
}
