export interface ListByTagInput {
  tagSlug: string;
  resourceType?: string;
  limit?: number;
  offset?: number;
}

export interface ListByTagOutput {
  resources: Array<{ resourceId: string; resourceType: string; taggedAt: Date }>;
  total: number;
}
