export class FormValidationFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormValidationFailed";
  }

  static create(details: string): FormValidationFailed {
    return new FormValidationFailed(`Form validation failed: ${details}`);
  }
}
