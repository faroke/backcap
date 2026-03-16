export interface ITokenService {
  generate(userId: string, roles: string[]): Promise<string>;
  verify(token: string): Promise<{ userId: string } | null>;
}
