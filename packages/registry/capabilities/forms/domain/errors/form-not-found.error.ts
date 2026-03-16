export class FormNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormNotFound";
  }

  static create(formId: string): FormNotFound {
    return new FormNotFound(`Form not found: "${formId}"`);
  }
}
