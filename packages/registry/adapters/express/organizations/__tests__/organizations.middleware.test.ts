import { describe, it, expect, beforeEach, vi } from "vitest";
import { createOrgScopeMiddleware } from "../organizations.middleware.js";
import { Result } from "../../../../capabilities/organizations/shared/result.js";
import { OrgNotFound } from "../../../../capabilities/organizations/domain/errors/org-not-found.error.js";

function createMockOrgService() {
  return {
    createOrganization: vi.fn(),
    getOrganization: vi.fn(),
    updateOrganization: vi.fn(),
    inviteMember: vi.fn(),
    acceptInvitation: vi.fn(),
    removeMember: vi.fn(),
    listMembers: vi.fn(),
  };
}

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("Org scope middleware", () => {
  let orgService: ReturnType<typeof createMockOrgService>;

  beforeEach(() => {
    orgService = createMockOrgService();
  });

  it("attaches org to request when found via params.orgId", async () => {
    orgService.getOrganization.mockResolvedValue(
      Result.ok({ id: "org-1", name: "Test", slug: "test", plan: "free", settings: {} }),
    );

    const middleware = createOrgScopeMiddleware(orgService);
    const req: any = { params: { orgId: "org-1" }, headers: {} };
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(req.org).toEqual({ id: "org-1", name: "Test", slug: "test" });
    expect(next).toHaveBeenCalled();
    expect(orgService.getOrganization).toHaveBeenCalledWith("org-1");
  });

  it("attaches org to request when found via params.id fallback", async () => {
    orgService.getOrganization.mockResolvedValue(
      Result.ok({ id: "org-1", name: "Test", slug: "test", plan: "free", settings: {} }),
    );

    const middleware = createOrgScopeMiddleware(orgService);
    const req: any = { params: { id: "org-1" }, headers: {} };
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(req.org).toEqual({ id: "org-1", name: "Test", slug: "test" });
    expect(next).toHaveBeenCalled();
  });

  it("returns 404 when org not found", async () => {
    orgService.getOrganization.mockResolvedValue(
      Result.fail(OrgNotFound.create("org-1")),
    );

    const middleware = createOrgScopeMiddleware(orgService);
    const req: any = { params: { id: "org-1" }, headers: {} };
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when no org ID in params", async () => {
    const middleware = createOrgScopeMiddleware(orgService);
    const req: any = { params: {}, headers: {} };
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
