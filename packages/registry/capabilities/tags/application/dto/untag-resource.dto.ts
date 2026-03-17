export interface UntagResourceInput {
  tagSlug: string;
  resourceId: string;
  resourceType: string;
}

export interface UntagResourceOutput {
  untaggedAt: Date;
}
