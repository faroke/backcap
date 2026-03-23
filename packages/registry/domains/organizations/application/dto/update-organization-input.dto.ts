export interface UpdateOrganizationInput {
  organizationId: string;
  name?: string;
  settings?: Record<string, unknown>;
}
