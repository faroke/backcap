import { describe, it, expect, vi } from "vitest";
import { createRbacRouter } from "../rbac.router.js";
import { Result } from "../../../../capabilities/rbac/shared/result.js";
import { DuplicateRole } from "../../../../capabilities/rbac/domain/errors/duplicate-role.error.js";
import { RoleNotFound } from "../../../../capabilities/rbac/domain/errors/role-not-found.error.js";

function createMockAuthorizationService() {
  return {
    createRole: vi.fn(),
    assignRole: vi.fn(),
    revokeRole: vi.fn(),
    checkPermission: vi.fn(),
    listRoles: vi.fn(),
    getUserPermissions: vi.fn(),
  };
}

function createMockRouter() {
  const handlers = new Map<string, Function>();
  return {
    get: vi.fn((path: string, handler: Function) => handlers.set(`GET:${path}`, handler)),
    post: vi.fn((path: string, handler: Function) => handlers.set(`POST:${path}`, handler)),
    delete: vi.fn((path: string, handler: Function) => handlers.set(`DELETE:${path}`, handler)),
    getHandler: (method: string, path: string) => handlers.get(`${method}:${path}`)!,
  };
}

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("rbac.router", () => {
  it("POST /roles returns 201 on success", async () => {
    const service = createMockAuthorizationService();
    service.createRole.mockResolvedValue(Result.ok({ roleId: "role-1" }));
    const router = createMockRouter();
    createRbacRouter(service, router as any);

    const handler = router.getHandler("POST", "/roles");
    const res = createMockRes();
    await handler({ body: { name: "admin", description: "Admin role" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ roleId: "role-1" });
  });

  it("POST /roles returns 409 on duplicate", async () => {
    const service = createMockAuthorizationService();
    service.createRole.mockResolvedValue(Result.fail(DuplicateRole.create("admin")));
    const router = createMockRouter();
    createRbacRouter(service, router as any);

    const handler = router.getHandler("POST", "/roles");
    const res = createMockRes();
    await handler({ body: { name: "admin", description: "Admin" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("GET /roles returns 200 with roles", async () => {
    const service = createMockAuthorizationService();
    service.listRoles.mockResolvedValue(Result.ok([{ id: "r1", name: "admin", description: "Admin", permissions: [] }]));
    const router = createMockRouter();
    createRbacRouter(service, router as any);

    const handler = router.getHandler("GET", "/roles");
    const res = createMockRes();
    await handler({ body: {} }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("POST /roles/assign returns 200 on success", async () => {
    const service = createMockAuthorizationService();
    service.assignRole.mockResolvedValue(Result.ok({ event: {} }));
    const router = createMockRouter();
    createRbacRouter(service, router as any);

    const handler = router.getHandler("POST", "/roles/assign");
    const res = createMockRes();
    await handler({ body: { userId: "u1", roleId: "r1" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("POST /roles/assign returns 404 on role not found", async () => {
    const service = createMockAuthorizationService();
    service.assignRole.mockResolvedValue(Result.fail(RoleNotFound.create("nonexistent")));
    const router = createMockRouter();
    createRbacRouter(service, router as any);

    const handler = router.getHandler("POST", "/roles/assign");
    const res = createMockRes();
    await handler({ body: { userId: "u1", roleId: "nonexistent" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("POST /roles/revoke returns 200 on success", async () => {
    const service = createMockAuthorizationService();
    service.revokeRole.mockResolvedValue(Result.ok({ event: {} }));
    const router = createMockRouter();
    createRbacRouter(service, router as any);

    const handler = router.getHandler("POST", "/roles/revoke");
    const res = createMockRes();
    await handler({ body: { userId: "u1", roleId: "r1" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
