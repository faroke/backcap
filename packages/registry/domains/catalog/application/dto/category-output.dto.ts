export interface CategoryOutput {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
