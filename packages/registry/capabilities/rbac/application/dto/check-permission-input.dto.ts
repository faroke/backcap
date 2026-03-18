export interface CheckPermissionInput {
  userId: string;
  action: string;
  resource: string;
  organizationId?: string;
}
