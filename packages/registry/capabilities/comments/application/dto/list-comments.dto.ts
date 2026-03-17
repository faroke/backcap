export interface ListCommentsInput {
  resourceId: string;
  resourceType: string;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListCommentsOutput {
  comments: Array<{
    commentId: string;
    content: string;
    authorId: string;
    resourceId: string;
    resourceType: string;
    parentId: string | undefined;
    createdAt: Date;
    deletedAt: Date | undefined;
  }>;
  total: number;
}
