// Template: import type { IOrganizationService } from "{{capabilities_path}}/organizations/contracts";
import type { IOrganizationService } from "../../../capabilities/organizations/contracts/index.js";

interface Request {
  params: Record<string, string>;
  headers: Record<string, string | undefined>;
  org?: { id: string; name: string; slug: string };
}

interface Response {
  status(code: number): Response;
  json(data: unknown): void;
}

type NextFunction = (err?: unknown) => void;
type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;

export function createOrgScopeMiddleware(
  orgService: IOrganizationService,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const orgId = req.params.orgId ?? req.params.id;
    if (!orgId) {
      res.status(400).json({ error: "Organization ID is required" });
      return;
    }

    const result = await orgService.getOrganization(orgId);
    if (result.isFail()) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }

    const org = result.unwrap();
    req.org = { id: org.id, name: org.name, slug: org.slug };
    next();
  };
}
