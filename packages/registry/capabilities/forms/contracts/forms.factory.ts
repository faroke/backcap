import type { IFormStore } from "../application/ports/form-store.port.js";
import { CreateForm } from "../application/use-cases/create-form.use-case.js";
import { SubmitForm } from "../application/use-cases/submit-form.use-case.js";
import { GetSubmissions } from "../application/use-cases/get-submissions.use-case.js";
import type { IFormsService } from "./forms.contract.js";

export type FormsDeps = {
  formStore: IFormStore;
};

export function createFormsService(deps: FormsDeps): IFormsService {
  const createForm = new CreateForm(deps.formStore);
  const submitForm = new SubmitForm(deps.formStore);
  const getSubmissions = new GetSubmissions(deps.formStore);

  return {
    createForm: (input) => createForm.execute(input),
    submitForm: (input) =>
      submitForm.execute(input).then((r) => r.map((v) => v.output)),
    getSubmissions: (input) => getSubmissions.execute(input),
  };
}
