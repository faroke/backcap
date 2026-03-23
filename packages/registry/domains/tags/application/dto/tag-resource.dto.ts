export interface TagResourceInput {
  tagSlug: string;
  resourceId: string;
  resourceType: string;
}

export interface TagResourceOutput {
  taggedAt: Date;
}
