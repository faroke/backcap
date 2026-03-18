import { describe, it, expect, vi } from "vitest";
import { createAuthMiddleware } from "../auth.middleware.js";

function createMockTokenService() {
  return {
    generate: vi.fn(),
    verify: vi.fn(),
  };
}

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("auth.middleware", () => {
  it("attaches userId on valid token", async () => {
    const tokenService = createMockTokenService();
    tokenService.verify.mockResolvedValue({ userId: "user-1" });
    const middleware = createAuthMiddleware(tokenService);

    const req: any = { headers: { authorization: "Bearer valid-token" } };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(req.user).toEqual({ userId: "user-1" });
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 401 on missing Authorization header", async () => {
    const tokenService = createMockTokenService();
    const middleware = createAuthMiddleware(tokenService);

    const req: any = { headers: {} };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 on invalid token", async () => {
    const tokenService = createMockTokenService();
    tokenService.verify.mockResolvedValue(null);
    const middleware = createAuthMiddleware(tokenService);

    const req: any = { headers: { authorization: "Bearer bad-token" } };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("exposes organizationId from token payload", async () => {
    const tokenService = createMockTokenService();
    tokenService.verify.mockResolvedValue({ userId: "user-1", organizationId: "org-42" });
    const middleware = createAuthMiddleware(tokenService);

    const req: any = { headers: { authorization: "Bearer valid-token" } };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(req.user).toEqual({ userId: "user-1", organizationId: "org-42" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("handles missing organizationId gracefully", async () => {
    const tokenService = createMockTokenService();
    tokenService.verify.mockResolvedValue({ userId: "user-1" });
    const middleware = createAuthMiddleware(tokenService);

    const req: any = { headers: { authorization: "Bearer valid-token" } };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(req.user).toEqual({ userId: "user-1", organizationId: undefined });
    expect(next).toHaveBeenCalledOnce();
  });

  it("returns 401 on malformed Authorization header", async () => {
    const tokenService = createMockTokenService();
    const middleware = createAuthMiddleware(tokenService);

    const req: any = { headers: { authorization: "Basic abc" } };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
