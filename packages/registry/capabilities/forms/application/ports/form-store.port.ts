import type { Form } from "../../domain/entities/form.entity.js";

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  submittedAt: Date;
}

export interface IFormStore {
  saveForm(form: Form): Promise<void>;
  findFormById(id: string): Promise<Form | null>;
  saveSubmission(submission: FormSubmission): Promise<void>;
  getSubmissions(formId: string): Promise<FormSubmission[]>;
}
