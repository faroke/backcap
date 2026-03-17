export interface GetSubmissionsInput {
  formId: string;
  limit?: number;
  offset?: number;
}

export interface GetSubmissionsOutput {
  submissions: Array<{
    submissionId: string;
    data: Record<string, unknown>;
    submittedAt: Date;
  }>;
  total: number;
}
