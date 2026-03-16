export class FormValidationFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormValidationFailed";
  }

  static create(reason: string): FormValidationFailed {
    return new FormValidationFailed(`Form validation failed: ${reason}`);
  }
}
