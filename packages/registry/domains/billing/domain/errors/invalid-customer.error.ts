export class InvalidCustomer extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCustomer";
  }

  static invalidEmail(email: string): InvalidCustomer {
    return new InvalidCustomer(`Invalid customer email: "${email}"`);
  }

  static nameRequired(): InvalidCustomer {
    return new InvalidCustomer("Customer name is required");
  }
}
