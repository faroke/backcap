export interface CreateTagInput {
  name: string;
}

export interface CreateTagOutput {
  tagId: string;
  slug: string;
  createdAt: Date;
}
