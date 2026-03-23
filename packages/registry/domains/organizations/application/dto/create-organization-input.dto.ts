export interface CreateOrganizationInput {
  name: string;
  slug: string;
  ownerId: string;
  plan?: string;
  settings?: Record<string, unknown>;
}
