export class InvalidFormField extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFormField";
  }

  static emptyName(): InvalidFormField {
    return new InvalidFormField("Field name cannot be empty");
  }

  static missingOptions(fieldName: string): InvalidFormField {
    return new InvalidFormField(
      `Field "${fieldName}" of type "select" requires non-empty options`,
    );
  }
}
