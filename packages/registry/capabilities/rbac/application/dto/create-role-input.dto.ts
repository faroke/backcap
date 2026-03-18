export interface CreateRoleInput {
  name: string;
  description: string;
  permissions?: { action: string; resource: string; conditions?: Record<string, unknown> }[];
}
