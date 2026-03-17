export interface SubmitFormInput {
  formId: string;
  data: Record<string, unknown>;
}

export interface SubmitFormOutput {
  submissionId: string;
  submittedAt: Date;
}
