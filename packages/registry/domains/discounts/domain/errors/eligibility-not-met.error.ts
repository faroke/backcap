export class EligibilityNotMet extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EligibilityNotMet";
  }

  static create(id: string): EligibilityNotMet {
    return new EligibilityNotMet(`Eligibility conditions not met for promotion: ${id}`);
  }
}
