export interface PostCommentInput {
  content: string;
  authorId: string;
  resourceId: string;
  resourceType: string;
  parentId?: string;
}

export interface PostCommentOutput {
  commentId: string;
  createdAt: Date;
}
