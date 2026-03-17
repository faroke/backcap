export interface DeleteCommentInput {
  commentId: string;
  requesterId: string;
}

export interface DeleteCommentOutput {
  deletedAt: Date;
}
