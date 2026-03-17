import type { Result } from "../shared/result.js";
import type { CreateFormInput, CreateFormOutput } from "../application/dto/create-form.dto.js";
import type { SubmitFormInput, SubmitFormOutput } from "../application/dto/submit-form.dto.js";
import type { GetSubmissionsInput, GetSubmissionsOutput } from "../application/dto/get-submissions.dto.js";

export type { CreateFormInput, CreateFormOutput };
export type { SubmitFormInput, SubmitFormOutput };
export type { GetSubmissionsInput, GetSubmissionsOutput };

export interface IFormsService {
  createForm(input: CreateFormInput): Promise<Result<CreateFormOutput, Error>>;
  submitForm(input: SubmitFormInput): Promise<Result<SubmitFormOutput, Error>>;
  getSubmissions(input: GetSubmissionsInput): Promise<Result<GetSubmissionsOutput, Error>>;
}
