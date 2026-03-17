import type { Form } from "../../domain/entities/form.entity.js";

export interface IFormStore {
  saveForm(form: Form): Promise<void>;
  findFormById(id: string): Promise<Form | undefined>;
  saveSubmission(
    formId: string,
    data: Record<string, unknown>,
  ): Promise<{ submissionId: string }>;
  getSubmissions(
    formId: string,
    pagination: { limit: number; offset: number },
  ): Promise<{
    submissions: Array<{
      submissionId: string;
      data: Record<string, unknown>;
      submittedAt: Date;
    }>;
    total: number;
  }>;
}
