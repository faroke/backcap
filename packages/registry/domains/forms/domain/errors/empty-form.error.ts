export class EmptyForm extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmptyForm";
  }

  static create(): EmptyForm {
    return new EmptyForm("A form must have at least one field");
  }
}
