import type { Result } from "../shared/result.js";
import type { FormFieldType } from "../domain/value-objects/form-field.vo.js";
import type { FormSubmission } from "../application/ports/form-store.port.js";

export interface FormsCreateFieldInput {
  name: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
}

export interface FormsCreateInput {
  name: string;
  fields: FormsCreateFieldInput[];
}

export interface FormsSubmitInput {
  formId: string;
  data: Record<string, unknown>;
}

export interface FormsGetSubmissionsInput {
  formId: string;
}

export interface IFormsService {
  createForm(input: FormsCreateInput): Promise<Result<{ formId: string }, Error>>;
  submitForm(input: FormsSubmitInput): Promise<Result<{ submissionId: string }, Error>>;
  getSubmissions(input: FormsGetSubmissionsInput): Promise<Result<FormSubmission[], Error>>;
}
