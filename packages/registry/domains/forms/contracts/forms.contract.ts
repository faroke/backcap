import type { Result } from "../shared/result.js";
import type { CreateFormInput, CreateFormOutput } from "../application/dto/create-form.dto.js";
import type { SubmitFormInput, SubmitFormOutput } from "../application/dto/submit-form.dto.js";
import type { GetSubmissionsInput, GetSubmissionsOutput } from "../application/dto/get-submissions.dto.js";
import type { InvalidFormField } from "../domain/errors/invalid-form-field.error.js";
import type { EmptyForm } from "../domain/errors/empty-form.error.js";
import type { FormNotFound } from "../domain/errors/form-not-found.error.js";
import type { FormValidationFailed } from "../domain/errors/form-validation-failed.error.js";

export type { CreateFormInput, CreateFormOutput };
export type { SubmitFormInput, SubmitFormOutput };
export type { GetSubmissionsInput, GetSubmissionsOutput };

export interface IFormsService {
  createForm(
    input: CreateFormInput,
  ): Promise<Result<CreateFormOutput, InvalidFormField | EmptyForm>>;
  submitForm(
    input: SubmitFormInput,
  ): Promise<Result<SubmitFormOutput, FormNotFound | FormValidationFailed>>;
  getSubmissions(
    input: GetSubmissionsInput,
  ): Promise<Result<GetSubmissionsOutput, FormNotFound>>;
}
